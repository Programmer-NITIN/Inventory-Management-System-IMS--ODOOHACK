const router = require('express').Router();
const warehouseController = require('../controllers/warehouseController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', warehouseController.list);
router.post('/', authorize(['manager']), warehouseController.create);
router.put('/:id', authorize(['manager']), warehouseController.update);
router.get('/:id/locations', warehouseController.getLocations);

module.exports = router;
