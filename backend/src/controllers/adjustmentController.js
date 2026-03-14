const adjustmentModel = require('../models/adjustmentModel');
const adjustmentService = require('../services/adjustmentService');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const adjustmentController = {
  async list(req, res, next) {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { data, total } = await adjustmentModel.findAll({ limit, offset });
      res.json(paginatedResponse(data, total, { page, limit }));
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const adjustment = await adjustmentService.createAdjustment({ ...req.body, userId: req.user.id });
      res.status(201).json({ success: true, data: adjustment });
    } catch (err) { next(err); }
  },
};

module.exports = adjustmentController;
