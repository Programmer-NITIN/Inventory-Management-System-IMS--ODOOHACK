const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', authorize(['manager']), categoryController.create);

module.exports = router;
