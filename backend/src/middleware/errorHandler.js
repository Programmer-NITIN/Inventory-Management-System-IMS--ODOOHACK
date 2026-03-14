/**
 * Global error handler middleware.
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log the error (only full stack for unexpected errors)
  if (!err.isOperational) {
    console.error('Unexpected Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message: err.message || 'An unexpected error occurred',
  });
}

module.exports = errorHandler;
