'use strict';

const { normalizeError } = require('../utils/normalizeResponse');

/**
 * 404 — Not Found handler.
 * Catches any request that didn't match a route.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler.
 * Must have 4 parameters for Express to recognize it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDev      = process.env.NODE_ENV === 'development';

  // Log all 500-level errors
  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, {
      message:    err.message,
      requestId:  req.requestId,
      stack:      isDev ? err.stack : undefined,
    });
  }

  const response = normalizeError(
    isDev ? err.message : statusCode >= 500 ? 'Une erreur interne est survenue.' : err.message,
    statusCode,
    {
      requestId: req.requestId,
      path:      req.originalUrl,
      method:    req.method,
      ...(isDev && statusCode >= 500 ? { stack: err.stack } : {}),
    }
  );

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
