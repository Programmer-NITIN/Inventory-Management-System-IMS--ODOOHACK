const { warehouseModel, locationModel } = require('../models/warehouseModel');
const AppError = require('../utils/AppError');

const warehouseController = {
  async list(req, res, next) {
    try {
      const warehouses = await warehouseModel.findAll();
      res.json({ success: true, data: warehouses });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const warehouse = await warehouseModel.create(req.body);
      res.status(201).json({ success: true, data: warehouse });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const warehouse = await warehouseModel.update(req.params.id, req.body);
      if (!warehouse) throw new AppError('Warehouse not found', 404, 'NOT_FOUND');
      res.json({ success: true, data: warehouse });
    } catch (err) { next(err); }
  },

  async getLocations(req, res, next) {
    try {
      const locations = await locationModel.findByWarehouse(req.params.id);
      res.json({ success: true, data: locations });
    } catch (err) { next(err); }
  },

  async createLocation(req, res, next) {
    try {
      const location = await locationModel.create(req.body);
      res.status(201).json({ success: true, data: location });
    } catch (err) { next(err); }
  },
};

module.exports = warehouseController;
