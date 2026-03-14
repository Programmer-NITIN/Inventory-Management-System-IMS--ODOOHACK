const router = require('express').Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  categoryId: Joi.number().integer().allow(null),
  unit: Joi.string().default('units'),
  reorderLevel: Joi.number().integer().min(0).default(0),
  description: Joi.string().allow('', null),
});

const productUpdateSchema = Joi.object({
  name: Joi.string(),
  sku: Joi.string(),
  categoryId: Joi.number().integer().allow(null),
  unit: Joi.string(),
  reorderLevel: Joi.number().integer().min(0),
  description: Joi.string().allow('', null),
});

router.use(authenticate);

router.get('/', productController.list);
router.get('/:id', productController.getById);
router.post('/', authorize(['manager']), validate(productSchema), productController.create);
router.put('/:id', authorize(['manager']), validate(productUpdateSchema), productController.update);
router.delete('/:id', authorize(['manager']), productController.remove);

module.exports = router;
