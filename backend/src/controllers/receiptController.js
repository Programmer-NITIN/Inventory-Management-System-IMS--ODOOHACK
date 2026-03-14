const receiptModel = require('../models/receiptModel');
const receiptService = require('../services/receiptService');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const receiptController = {
  async list(req, res, next) {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { status, warehouseId } = req.query;
      const { data, total } = await receiptModel.findAll({ status, warehouseId, limit, offset });
      res.json(paginatedResponse(data, total, { page, limit }));
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const receipt = await receiptModel.findById(req.params.id);
      if (!receipt) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Receipt not found' });
      res.json({ success: true, data: receipt });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const receipt = await receiptService.createReceipt({ ...req.body, userId: req.user.id });
      res.status(201).json({ success: true, data: receipt });
    } catch (err) { next(err); }
  },

  async validate(req, res, next) {
    try {
      await receiptService.validateReceipt(parseInt(req.params.id), req.user.id);
      res.json({ success: true, data: { message: 'Receipt validated. Stock updated.' } });
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      await receiptService.cancelReceipt(parseInt(req.params.id));
      res.json({ success: true, data: { message: 'Receipt cancelled.' } });
    } catch (err) { next(err); }
  },
};

module.exports = receiptController;
