const router = require('express').Router();
const stockController = require('../controllers/stockController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', stockController.getLedger);

module.exports = router;
