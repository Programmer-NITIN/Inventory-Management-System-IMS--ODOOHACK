const router = require('express').Router();
const deliveryController = require('../controllers/deliveryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

const deliverySchema = Joi.object({
  customerName: Joi.string().allow('', null),
  warehouseId: Joi.number().integer().required(),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(Joi.object({
    productId: Joi.number().integer().required(),
    locationId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
  })).min(1).required(),
});

router.use(authenticate);

router.get('/', deliveryController.list);
router.get('/:id', deliveryController.getById);
router.post('/', validate(deliverySchema), deliveryController.create);

// Pick → Pack → Validate flow
router.post('/:id/pick', deliveryController.pick);
router.post('/:id/pack', deliveryController.pack);
router.post('/:id/validate', authorize(['manager']), deliveryController.validate);
router.post('/:id/cancel', authorize(['manager']), deliveryController.cancel);

module.exports = router;
