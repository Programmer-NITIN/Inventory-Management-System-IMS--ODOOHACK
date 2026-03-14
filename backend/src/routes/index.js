const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/warehouses', require('./warehouseRoutes'));
router.use('/locations', require('./locationRoutes'));
router.use('/receipts', require('./receiptRoutes'));
router.use('/deliveries', require('./deliveryRoutes'));
router.use('/transfers', require('./transferRoutes'));
router.use('/adjustments', require('./adjustmentRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/stock', require('./stockRoutes'));
router.use('/stock-ledger', require('./stockLedgerRoutes'));

module.exports = router;
