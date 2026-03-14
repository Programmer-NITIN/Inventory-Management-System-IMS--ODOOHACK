const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.use(authorize(['manager']));

router.get('/kpis', dashboardController.getKPIs);
router.get('/charts/category-distribution', dashboardController.getCategoryDistribution);
router.get('/charts/stock-movement', dashboardController.getStockMovement);
router.get('/charts/warehouse-utilization', dashboardController.getWarehouseUtilization);

module.exports = router;
