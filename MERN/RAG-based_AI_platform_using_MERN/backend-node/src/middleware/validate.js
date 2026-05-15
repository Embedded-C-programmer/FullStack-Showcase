const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Run after a chain of express-validator rules.
 * Collects all errors and throws an AppError with 400.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`).join('. ');
    return next(AppError.badRequest(messages, 'VALIDATION_ERROR'));
  }
  next();
};

// ── Auth ──────────────────────────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a digit'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a digit'),
];

// ── Documents ─────────────────────────────────────────────────────────────
const updateDocumentRules = [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title 1-200 chars'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be comma-separated string'),
];

// ── Chat ─────────────────────────────────────────────────────────────────
const sendMessageRules = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 4000 })
    .withMessage('Message must be under 4000 characters'),
];

const createSessionRules = [
  body('documentId').notEmpty().isMongoId().withMessage('Valid document ID required'),
  body('title').optional().trim().isLength({ max: 200 }),
];

// ── Params ────────────────────────────────────────────────────────────────
const mongoIdParam = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`${paramName} must be a valid MongoDB ObjectId`),
];

// ── Pagination ────────────────────────────────────────────────────────────
const paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit 1-100'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  updateDocumentRules,
  sendMessageRules,
  createSessionRules,
  mongoIdParam,
  paginationRules,
};
