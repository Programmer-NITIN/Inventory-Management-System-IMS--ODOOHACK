const transferModel = require('../models/transferModel');
const transferService = require('../services/transferService');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const transferController = {
  async list(req, res, next) {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { status } = req.query;
      const { data, total } = await transferModel.findAll({ status, limit, offset });
      res.json(paginatedResponse(data, total, { page, limit }));
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const transfer = await transferModel.findById(req.params.id);
      if (!transfer) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Transfer not found' });
      res.json({ success: true, data: transfer });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const transfer = await transferService.createTransfer({ ...req.body, userId: req.user.id });
      res.status(201).json({ success: true, data: transfer });
    } catch (err) { next(err); }
  },

  async complete(req, res, next) {
    try {
      await transferService.completeTransfer(parseInt(req.params.id), req.user.id);
      res.json({ success: true, data: { message: 'Transfer completed. Stock moved.' } });
    } catch (err) { next(err); }
  },
};

module.exports = transferController;
