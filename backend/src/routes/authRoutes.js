const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// Public — called after Firebase client-side login
router.post('/login', authController.login);

// Protected
router.get('/me', authenticate, authController.me);
router.put('/role', authenticate, authController.setRole);

// Manager-only staff management
router.get('/staff', authenticate, authController.listStaff);
router.put('/staff/:id/approve', authenticate, authController.approveStaff);
router.put('/staff/:id/remove', authenticate, authController.removeStaff);

module.exports = router;
