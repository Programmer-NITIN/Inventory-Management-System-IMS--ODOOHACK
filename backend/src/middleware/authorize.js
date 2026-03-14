const AppError = require('../utils/AppError');

/**
 * Middleware: Check if user has one of the allowed roles.
 * @param {string[]} roles - e.g. ['manager']
 */
function authorize(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }
    next();
  };
}

module.exports = authorize;
