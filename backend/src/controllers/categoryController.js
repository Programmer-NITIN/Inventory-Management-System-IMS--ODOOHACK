const categoryModel = require('../models/categoryModel');

const categoryController = {
  async list(req, res, next) {
    try {
      const categories = await categoryModel.findAll();
      res.json({ success: true, data: categories });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const category = await categoryModel.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) { next(err); }
  },
};

module.exports = categoryController;
