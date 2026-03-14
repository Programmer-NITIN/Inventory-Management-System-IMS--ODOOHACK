const admin = require('../config/firebase');
const pool = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Middleware: Verify Firebase ID token and attach user to request.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401, 'AUTH_REQUIRED');
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);

    // Fetch user from database
    const result = await pool.query(
      'SELECT id, firebase_uid, email, display_name, role, is_active FROM users WHERE firebase_uid = $1',
      [decoded.uid]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found in system. Contact administrator.', 403, 'USER_NOT_FOUND');
    }

    if (!result.rows[0].is_active) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.isOperational) return next(err);
    if (err.code === 'auth/id-token-expired') {
      return next(new AppError('Token expired. Please login again.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Authentication failed', 401, 'AUTH_FAILED'));
  }
}

module.exports = authenticate;
