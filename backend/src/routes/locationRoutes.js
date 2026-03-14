const router = require('express').Router();
const warehouseController = require('../controllers/warehouseController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.post('/', authorize(['manager']), warehouseController.createLocation);

module.exports = router;
