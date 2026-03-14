const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

const authController = {
  /**
   * POST /api/auth/login
   * Body: { firebaseUid, email, displayName, role? }
   * Called after Firebase client-side login to register/fetch the user.
   */
  async login(req, res, next) {
    try {
      const { firebaseUid, email, displayName, role } = req.body;

      let user = await userModel.findByFirebaseUid(firebaseUid);
      if (!user) {
        user = await userModel.create({ firebaseUid, email, displayName, role });
      }

      if (!user.is_active) {
        throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
      }

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/auth/me */
  async me(req, res) {
    res.json({ success: true, data: req.user });
  },
};

module.exports = authController;
