const dashboardService = require('../services/dashboardService');

const dashboardController = {
  async getKPIs(req, res, next) {
    try {
      const kpis = await dashboardService.getKPIs();
      res.json({ success: true, data: kpis });
    } catch (err) { next(err); }
  },

  async getCategoryDistribution(req, res, next) {
    try {
      const data = await dashboardService.getCategoryDistribution();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getStockMovement(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await dashboardService.getStockMovement(days);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getWarehouseUtilization(req, res, next) {
    try {
      const data = await dashboardService.getWarehouseUtilization();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getLowStockProducts(req, res, next) {
    try {
      const data = await dashboardService.getLowStockProducts();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

module.exports = dashboardController;
