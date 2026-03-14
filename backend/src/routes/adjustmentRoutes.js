const router = require('express').Router();
const adjustmentController = require('../controllers/adjustmentController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const adjustmentSchema = Joi.object({
  productId: Joi.number().integer().required(),
  locationId: Joi.number().integer().required(),
  countedQty: Joi.number().integer().min(0).required(),
  reason: Joi.string().allow('', null),
});

router.use(authenticate);

router.get('/', adjustmentController.list);
router.post('/', validate(adjustmentSchema), adjustmentController.create);

module.exports = router;
