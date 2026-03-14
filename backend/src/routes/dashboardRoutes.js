const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// KPIs accessible by both managers and staff
router.get('/kpis', dashboardController.getKPIs);

// Manager-only routes
router.get('/charts/category-distribution', authorize(['manager']), dashboardController.getCategoryDistribution);
router.get('/charts/stock-movement', authorize(['manager']), dashboardController.getStockMovement);
router.get('/charts/warehouse-utilization', authorize(['manager']), dashboardController.getWarehouseUtilization);
router.get('/low-stock', authorize(['manager']), dashboardController.getLowStockProducts);

module.exports = router;
