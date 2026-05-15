/**
 * Operational errors — expected runtime failures (bad input, not found, etc.)
 * These are safe to send to the client. Programmer errors bubble up as 500s.
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common factory helpers
AppError.badRequest = (msg, code) => new AppError(msg, 400, code || 'BAD_REQUEST');
AppError.unauthorized = (msg) => new AppError(msg || 'Not authenticated', 401, 'UNAUTHORIZED');
AppError.forbidden = (msg) => new AppError(msg || 'Access denied', 403, 'FORBIDDEN');
AppError.notFound = (resource) =>
  new AppError(`${resource || 'Resource'} not found`, 404, 'NOT_FOUND');
AppError.conflict = (msg, code) => new AppError(msg, 409, code || 'CONFLICT');
AppError.tooMany = (msg) =>
  new AppError(msg || 'Too many requests', 429, 'TOO_MANY_REQUESTS');
AppError.internal = (msg) =>
  new AppError(msg || 'Internal server error', 500, 'INTERNAL_ERROR');
AppError.serviceUnavailable = (service) =>
  new AppError(`${service || 'Downstream service'} is unavailable`, 503, 'SERVICE_UNAVAILABLE');

module.exports = AppError;
