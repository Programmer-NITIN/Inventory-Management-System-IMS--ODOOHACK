const router = require('express').Router();
const stockController = require('../controllers/stockController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', stockController.getStock);

module.exports = router;
