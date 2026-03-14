const deliveryModel = require('../models/deliveryModel');
const deliveryService = require('../services/deliveryService');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const deliveryController = {
  async list(req, res, next) {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { status, warehouseId } = req.query;
      const { data, total } = await deliveryModel.findAll({ status, warehouseId, limit, offset });
      res.json(paginatedResponse(data, total, { page, limit }));
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const delivery = await deliveryModel.findById(req.params.id);
      if (!delivery) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Delivery not found' });
      res.json({ success: true, data: delivery });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const delivery = await deliveryService.createDelivery({ ...req.body, userId: req.user.id });
      res.status(201).json({ success: true, data: delivery });
    } catch (err) { next(err); }
  },

  async validate(req, res, next) {
    try {
      await deliveryService.validateDelivery(parseInt(req.params.id), req.user.id);
      res.json({ success: true, data: { message: 'Delivery validated. Stock updated.' } });
    } catch (err) { next(err); }
  },

  async cancel(req, res, next) {
    try {
      await deliveryService.cancelDelivery(parseInt(req.params.id));
      res.json({ success: true, data: { message: 'Delivery cancelled.' } });
    } catch (err) { next(err); }
  },
};

module.exports = deliveryController;
