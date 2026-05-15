/**
 * Standardised response envelope used across all controllers.
 * { success, message?, data?, pagination?, meta? }
 */

const sendSuccess = (res, data, statusCode = 200, message = null, extras = {}) => {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  Object.assign(body, extras);
  return res.status(statusCode).json(body);
};

const sendCreated = (res, data, message = null) => sendSuccess(res, data, 201, message);

const sendPaginated = (res, data, pagination) =>
  sendSuccess(res, data, 200, null, { pagination });

const sendNoContent = (res) => res.status(204).send();

module.exports = { sendSuccess, sendCreated, sendPaginated, sendNoContent };
