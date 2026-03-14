const productModel = require('../models/productModel');
const AppError = require('../utils/AppError');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const productController = {
  async list(req, res, next) {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { search, categoryId } = req.query;
      const { data, total } = await productModel.findAll({ search, categoryId, limit, offset });
      res.json(paginatedResponse(data, total, { page, limit }));
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const product = await productModel.findById(req.params.id);
      if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
      const stock = await productModel.getStockByProduct(req.params.id);
      res.json({ success: true, data: { ...product, stock } });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const product = await productModel.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      if (err.code === '23505') return next(new AppError('SKU already exists', 409, 'DUPLICATE_SKU'));
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const product = await productModel.update(req.params.id, req.body);
      if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      const product = await productModel.softDelete(req.params.id);
      if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
      res.json({ success: true, data: { message: 'Product deleted' } });
    } catch (err) { next(err); }
  },
};

module.exports = productController;
