const stockModel = require('../models/stockModel');
const stockLedgerModel = require('../models/stockLedgerModel');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const stockController = {
  async getStock(req, res, next) {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { productId, warehouseId } = req.query;
      const data = await stockModel.getAll({ productId, warehouseId, limit, offset });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getLedger(req, res, next) {
    try {
      const { page, limit, offset } = getPagination(req.query);
      const { productId, movementType } = req.query;
      const { data, total } = await stockLedgerModel.findAll({ productId, movementType, limit, offset });
      res.json(paginatedResponse(data, total, { page, limit }));
    } catch (err) { next(err); }
  },
};

module.exports = stockController;
