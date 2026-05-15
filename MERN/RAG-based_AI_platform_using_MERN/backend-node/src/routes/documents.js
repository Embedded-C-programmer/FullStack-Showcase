const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

// Ensure upload directory exists at startup
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const ALLOWED_MIMES = new Set(
  (process.env.ALLOWED_TYPES || '').split(',').filter(Boolean)
);

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIMES.size || ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error(`File type "${file.mimetype}" is not allowed.`), {
        statusCode: 415,
      }),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

// Multer error handler — converts MulterError to a clean JSON response
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${Math.round((parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024)} MB.`,
      });
    }
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'File upload error.',
    });
  });
};

router.use(protect);

router.get('/',           documentController.getDocuments);
router.post('/upload',    handleUpload, documentController.uploadDocument);
router.get('/:id',        documentController.getDocument);
router.patch('/:id',      documentController.updateDocument);
router.delete('/:id',     documentController.deleteDocument);
router.get('/:id/status', documentController.getDocumentStatus);
router.post('/:id/reprocess', documentController.reprocessDocument);

module.exports = router;
