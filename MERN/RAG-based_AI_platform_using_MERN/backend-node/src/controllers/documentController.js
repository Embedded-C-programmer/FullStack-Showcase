const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Document = require('../models/Document');
const User = require('../models/User');
const logger = require('../utils/logger');

const AI_SERVICE = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Give large PDFs plenty of time. A 7MB PDF with MiniLM takes ~30-90s on CPU.
const PROCESS_TIMEOUT_MS = parseInt(process.env.PYTHON_SERVICE_TIMEOUT_MS) || 600_000; // 10 min
const HEALTH_TIMEOUT_MS  = 5_000;
const MAX_RETRIES        = 2;   // 3 total attempts
const RETRY_BASE_MS      = 3_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── helpers ───────────────────────────────────────────────────────────────

async function isPythonServiceHealthy() {
  try {
    const res = await axios.get(`${AI_SERVICE}/health`, { timeout: HEALTH_TIMEOUT_MS });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function callProcessEndpoint(filePath, docId, userId) {
  let lastErr;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      // Create a fresh FormData / stream for every attempt
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('document_id', docId.toString());
      formData.append('user_id', userId);

      const response = await axios.post(`${AI_SERVICE}/process`, formData, {
        headers: formData.getHeaders(),
        timeout: PROCESS_TIMEOUT_MS,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (err) {
      lastErr = err;

      // Don't retry on timeout — large docs just need more time; retrying
      // would just queue another expensive job. Surface the error immediately.
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        throw new Error(
          `Python AI service timed out processing document (${PROCESS_TIMEOUT_MS / 1000}s). ` +
          `The document may be too large or the server is overloaded. Try re-uploading a smaller file or use POST /${docId}/reprocess.`
        );
      }

      // Don't retry if Python returned a 4xx (bad input, parse error etc.)
      if (err.response?.status >= 400 && err.response?.status < 500) {
        const detail = err.response.data?.detail || err.message;
        throw new Error(`AI service rejected the document: ${detail}`);
      }

      // Retry on connection refused / 5xx
      if (attempt <= MAX_RETRIES) {
        const delay = RETRY_BASE_MS * attempt;
        logger.warn(
          `AI service attempt ${attempt}/${MAX_RETRIES + 1} failed for doc ${docId}: ` +
          `${err.message} — retrying in ${delay / 1000}s`
        );
        await sleep(delay);
      }
    }
  }

  const detail = lastErr?.response?.data?.detail || lastErr?.message || 'Unknown error';
  throw new Error(`AI processing failed after ${MAX_RETRIES + 1} attempts: ${detail}`);
}

async function processDocumentAsync(docId, filePath, userId) {
  try {
    // Quick health-check so we surface a clear error without waiting for
    // the full process timeout if Python isn't running at all.
    const healthy = await isPythonServiceHealthy();
    if (!healthy) {
      throw new Error(
        `Python AI service is not reachable at ${AI_SERVICE}. ` +
        `Start it with:  uvicorn src.main:app --reload --port 8000`
      );
    }

    const { chunk_count, word_count, page_count } = await callProcessEndpoint(
      filePath, docId, userId
    );

    await Document.findByIdAndUpdate(docId, {
      status: 'ready',
      chunkCount: chunk_count,
      wordCount: word_count,
      pageCount: page_count,
      lastIndexedAt: new Date(),
      faissIndexId: `${userId}_${docId}`,
      processingError: null,
    });

    logger.info(`✅ Document ${docId} processed: ${chunk_count} chunks, ${word_count} words`);
  } catch (err) {
    logger.error(`❌ Document ${docId} failed: ${err.message}`);
    await Document.findByIdAndUpdate(docId, {
      status: 'failed',
      processingError: err.message,
    });
  }
}

// ── controllers ───────────────────────────────────────────────────────────

exports.getDocuments = async (req, res) => {
  const { page = 1, limit = 20, status, tag, search } = req.query;
  const parsedPage  = Math.max(1, parseInt(page));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = { owner: req.user._id };
  if (status) filter.status = status;
  if (tag)    filter.tags = tag;
  if (search) {
    filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  const [docs, total] = await Promise.all([
    Document.find(filter)
      .select('-chunks')
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit),
    Document.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      documents: docs,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
      },
    },
  });
};

exports.getDocument = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
  res.json({ success: true, data: { document: doc } });
};

exports.uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const { title, description, tags } = req.body;
  const user = await User.findById(req.user._id);

  if (user.storageUsed + req.file.size > user.storageLimit) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: 'Storage quota exceeded.' });
  }

  const doc = await Document.create({
    owner:        req.user._id,
    title:        title || req.file.originalname.replace(/\.[^/.]+$/, ''),
    description,
    filename:     req.file.filename,
    originalName: req.file.originalname,
    mimeType:     req.file.mimetype,
    fileSize:     req.file.size,
    filePath:     req.file.path,
    tags:         tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    status:       'processing',
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: req.file.size } });

  // Fire-and-forget — 202 response goes back immediately
  processDocumentAsync(doc._id, req.file.path, req.user._id.toString());

  res.status(202).json({
    success: true,
    message: 'Document uploaded. AI processing started in background.',
    data: { document: doc },
  });
};

exports.deleteDocument = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

  try {
    await axios.delete(`${AI_SERVICE}/documents/${req.params.id}`, {
      params: { user_id: req.user._id.toString() },
      timeout: 10_000,
    });
  } catch (err) {
    logger.warn(`FAISS cleanup skipped for doc ${req.params.id}: ${err.message}`);
  }

  if (doc.filePath && fs.existsSync(doc.filePath)) {
    fs.unlinkSync(doc.filePath);
  }

  await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: -(doc.fileSize || 0) } });
  await doc.deleteOne();

  res.json({ success: true, message: 'Document deleted.' });
};

exports.updateDocument = async (req, res) => {
  const { title, description, tags } = req.body;
  const set = {};
  if (title !== undefined)       set.title = title;
  if (description !== undefined) set.description = description;
  if (tags !== undefined)        set.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);

  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: set },
    { new: true, runValidators: true }
  );
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
  res.json({ success: true, data: { document: doc } });
};

exports.getDocumentStatus = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id }).select(
    'status processingError chunkCount wordCount pageCount lastIndexedAt'
  );
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
  res.json({ success: true, data: doc });
};

exports.reprocessDocument = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id });
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

  if (doc.status === 'ready' || doc.status === 'processing') {
    return res.status(400).json({
      success: false,
      message: `Document is already "${doc.status}". Only failed/uploading documents can be reprocessed.`,
    });
  }

  if (!doc.filePath || !fs.existsSync(doc.filePath)) {
    return res.status(400).json({
      success: false,
      message: 'Original file is missing from disk. Please re-upload the document.',
    });
  }

  await Document.findByIdAndUpdate(doc._id, {
    status: 'processing',
    processingError: null,
    chunkCount: undefined,
    wordCount: undefined,
  });

  processDocumentAsync(doc._id, doc.filePath, req.user._id.toString());

  res.json({
    success: true,
    message: 'Reprocessing started. Poll /status for updates.',
    data: { documentId: doc._id },
  });
};
