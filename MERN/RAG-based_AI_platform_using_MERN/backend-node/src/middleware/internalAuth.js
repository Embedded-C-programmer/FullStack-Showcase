const AppError = require('../utils/AppError');

/**
 * Middleware that verifies the shared INTERNAL_API_SECRET header.
 * Used to lock down routes that should only be called service-to-service.
 */
const requireInternalSecret = (req, _res, next) => {
  const secret = req.headers['x-internal-secret'];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return next(AppError.forbidden('Invalid or missing internal API secret'));
  }
  next();
};

module.exports = { requireInternalSecret };
