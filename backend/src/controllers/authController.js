const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

const authController = {
  /**
   * POST /api/auth/login
   * Body: { firebaseUid, email, displayName, role? }
   */
  async login(req, res, next) {
    try {
      const { firebaseUid, email, displayName, role } = req.body;

      let user = await userModel.findByFirebaseUid(firebaseUid);
      let isNew = false;
      if (!user) {
        // Create new user with the selected role
        user = await userModel.create({ firebaseUid, email, displayName, role });
        isNew = true;
      } else if (role && role !== user.role) {
        // User exists but is re-signing up with a different role
        // (e.g. Google sign-in where signup/login is the same flow)
        const isActive = role === 'manager' ? true : user.is_active;
        user = await userModel.update(user.id, { role, isActive });
      }

      res.json({ success: true, data: user, isNew });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/auth/role
   * Body: { role } — 'manager' or 'staff'
   */
  async setRole(req, res, next) {
    try {
      const { role } = req.body;
      if (!['manager', 'staff'].includes(role)) {
        throw new AppError('Invalid role', 400, 'INVALID_ROLE');
      }
      const updatedUser = await userModel.update(req.user.id, { role });
      res.json({ success: true, data: updatedUser });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/auth/me */
  async me(req, res) {
    res.json({ success: true, data: req.user });
  },

  /**
   * GET /api/auth/staff — Manager only: list all staff users
   */
  async listStaff(req, res, next) {
    try {
      if (req.user.role !== 'manager') {
        throw new AppError('Only managers can view staff list', 403, 'FORBIDDEN');
      }
      const staff = await userModel.findAllStaff();
      res.json({ success: true, data: staff });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/auth/staff/:id/approve — Manager only
   */
  async approveStaff(req, res, next) {
    try {
      if (req.user.role !== 'manager') {
        throw new AppError('Only managers can approve staff', 403, 'FORBIDDEN');
      }
      const user = await userModel.setActive(req.params.id, true);
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/auth/staff/:id/remove — Manager only
   */
  async removeStaff(req, res, next) {
    try {
      if (req.user.role !== 'manager') {
        throw new AppError('Only managers can remove staff', 403, 'FORBIDDEN');
      }
      const user = await userModel.setActive(req.params.id, false);
      if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
