const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// Public — called after Firebase client-side login
router.post('/login', authController.login);

// Protected
router.get('/me', authenticate, authController.me);

module.exports = router;
