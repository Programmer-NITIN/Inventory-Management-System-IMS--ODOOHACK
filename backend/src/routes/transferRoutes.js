const router = require('express').Router();
const transferController = require('../controllers/transferController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const transferSchema = Joi.object({
  sourceWarehouseId: Joi.number().integer().required(),
  destWarehouseId: Joi.number().integer().required(),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(Joi.object({
    productId: Joi.number().integer().required(),
    sourceLocationId: Joi.number().integer().required(),
    destLocationId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
  })).min(1).required(),
});

router.use(authenticate);

router.get('/', transferController.list);
router.get('/:id', transferController.getById);
router.post('/', validate(transferSchema), transferController.create);
router.post('/:id/complete', transferController.complete);

module.exports = router;
