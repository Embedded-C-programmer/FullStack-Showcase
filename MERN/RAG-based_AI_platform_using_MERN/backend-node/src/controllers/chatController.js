const axios = require('axios');
const ChatSession = require('../models/ChatSession');
const Document = require('../models/Document');
const logger = require('../utils/logger');

const AI_SERVICE = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Chat RAG calls can be slow on CPU (embedding + LLM). 
// Match this to PYTHON_CHAT_TIMEOUT_MS in .env (default 90s).
const CHAT_TIMEOUT_MS = parseInt(process.env.PYTHON_CHAT_TIMEOUT_MS) || 90_000;

// ── helpers ───────────────────────────────────────────────────────────────

/**
 * Extract the most useful error message from an axios error.
 * Never returns an empty string.
 */
function describeAxiosError(err) {
  // Python FastAPI validation / application error
  if (err.response) {
    const status = err.response.status;
    const data   = err.response.data;
    const detail = data?.detail || data?.message || JSON.stringify(data);
    return `Python AI service returned ${status}: ${detail}`;
  }

  // No response — network/connection issue
  if (err.code === 'ECONNREFUSED') {
    return `Python AI service is not running at ${AI_SERVICE}. Start it with: uvicorn src.main:app --reload --port 8000`;
  }
  if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
    return `Python AI service timed out after ${CHAT_TIMEOUT_MS / 1000}s. The LLM may be slow — try again or set LLM_BACKEND=none.`;
  }
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
    return `Network error reaching Python AI service (${err.code}): ${err.message}`;
  }

  return err.message || 'Unknown error communicating with the AI service';
}

// ── controllers ───────────────────────────────────────────────────────────

// GET /api/chat/sessions?documentId=
exports.getSessions = async (req, res) => {
  const { documentId } = req.query;
  const filter = { owner: req.user._id, isArchived: false };
  if (documentId) filter.document = documentId;

  const sessions = await ChatSession.find(filter)
    .select('-messages')
    .populate('document', 'title status')
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, data: { sessions } });
};

// POST /api/chat/sessions
exports.createSession = async (req, res) => {
  const { documentId, title } = req.body;

  if (!documentId) {
    return res.status(400).json({ success: false, message: 'documentId is required.' });
  }

  const doc = await Document.findOne({ _id: documentId, owner: req.user._id });
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }
  if (doc.status !== 'ready') {
    return res.status(400).json({
      success: false,
      message: `Document is not ready for chat (status: ${doc.status}). Wait for processing to complete.`,
    });
  }

  const session = await ChatSession.create({
    owner:    req.user._id,
    document: documentId,
    title:    title || `Chat about "${doc.title}"`,
  });

  await Document.findByIdAndUpdate(documentId, { $inc: { chatCount: 1 } });

  res.status(201).json({ success: true, data: { session } });
};

// GET /api/chat/sessions/:id
exports.getSession = async (req, res) => {
  const session = await ChatSession.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('document', 'title status faissIndexId');
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }
  res.json({ success: true, data: { session } });
};

// POST /api/chat/sessions/:id/messages
exports.sendMessage = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    return res.status(400).json({ success: false, message: 'Message content is required.' });
  }

  const session = await ChatSession.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('document');

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }
  if (!session.document) {
    return res.status(400).json({ success: false, message: 'Session has no associated document.' });
  }
  if (session.document.status !== 'ready') {
    return res.status(400).json({
      success: false,
      message: `Document is not ready (status: ${session.document.status}). Cannot chat yet.`,
    });
  }

  // Append user message immediately
  const userMsg = { role: 'user', content: content.trim(), timestamp: new Date() };
  session.messages.push(userMsg);

  // Last 10 messages as conversation history
  const history = session.messages.slice(-10).map((m) => ({
    role:    m.role,
    content: m.content,
  }));

  let assistantMsg;
  const startTime = Date.now();

  try {
    logger.info(`Chat RAG request → doc=${session.document._id} session=${session._id} query="${content.trim().slice(0, 80)}"`);

    const ragResponse = await axios.post(
      `${AI_SERVICE}/chat`,
      {
        query:                content.trim(),
        document_id:          session.document._id.toString(),
        user_id:              req.user._id.toString(),
        conversation_history: history,
        top_k:                5,
      },
      {
        timeout: CHAT_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
        // Surface full error body on non-2xx
        validateStatus: (status) => status < 500,
      }
    );

    // Handle Python-returned 4xx errors gracefully
    if (ragResponse.status >= 400) {
      const detail = ragResponse.data?.detail || ragResponse.data?.message || 'Unknown error';
      logger.warn(`RAG returned ${ragResponse.status}: ${detail}`);
      assistantMsg = {
        role:      'assistant',
        content:   `The AI service returned an error (${ragResponse.status}): ${detail}`,
        latencyMs: Date.now() - startTime,
        timestamp: new Date(),
      };
    } else {
      const { answer, sources, tokens_used, llm_backend } = ragResponse.data;

      logger.info(
        `Chat RAG ok — backend=${llm_backend} tokens=${tokens_used} ` +
        `latency=${Date.now() - startTime}ms sources=${sources?.length ?? 0}`
      );

      assistantMsg = {
        role:      'assistant',
        content:   answer,
        sources:   sources || [],
        tokensUsed: tokens_used || 0,
        latencyMs:  Date.now() - startTime,
        timestamp:  new Date(),
      };
    }
  } catch (err) {
    const description = describeAxiosError(err);
    logger.error(`RAG query failed: ${description}`);

    assistantMsg = {
      role:      'assistant',
      content:   `I encountered an error while processing your question:\n\n> ${description}\n\nPlease ensure the Python AI service is running and try again.`,
      latencyMs:  Date.now() - startTime,
      timestamp:  new Date(),
    };
  }

  session.messages.push(assistantMsg);
  await session.save();

  res.json({
    success: true,
    data: {
      userMessage:      userMsg,
      assistantMessage: assistantMsg,
    },
  });
};

// DELETE /api/chat/sessions/:id
exports.deleteSession = async (req, res) => {
  const session = await ChatSession.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }
  res.json({ success: true, message: 'Session deleted.' });
};

// PATCH /api/chat/sessions/:id/archive
exports.archiveSession = async (req, res) => {
  const session = await ChatSession.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { isArchived: true },
    { new: true }
  );
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found.' });
  }
  res.json({ success: true, data: { session } });
};
