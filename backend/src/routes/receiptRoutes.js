const router = require('express').Router();
const receiptController = require('../controllers/receiptController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

const receiptSchema = Joi.object({
  supplierName: Joi.string().allow('', null),
  warehouseId: Joi.number().integer().required(),
  notes: Joi.string().allow('', null),
  items: Joi.array().items(Joi.object({
    productId: Joi.number().integer().required(),
    locationId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).required(),
  })).min(1).required(),
});

router.use(authenticate);

router.get('/', receiptController.list);
router.get('/:id', receiptController.getById);
router.post('/', validate(receiptSchema), receiptController.create);
router.post('/:id/validate', authorize(['manager']), receiptController.validate);
router.post('/:id/cancel', authorize(['manager']), receiptController.cancel);

module.exports = router;
