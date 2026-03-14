const pool = require('../config/db');
const adjustmentModel = require('../models/adjustmentModel');
const stockModel = require('../models/stockModel');
const stockLedgerModel = require('../models/stockLedgerModel');
const AppError = require('../utils/AppError');

const adjustmentService = {
  async createAdjustment({ productId, locationId, countedQty, reason, userId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current system quantity (with row lock)
      const systemQty = await stockModel.getQuantity(client, productId, locationId);
      const reference = await adjustmentModel.getNextReference();

      const adjustment = await adjustmentModel.create(client, {
        reference,
        productId,
        locationId,
        systemQty,
        countedQty,
        reason,
        createdBy: userId,
      });

      // Update stock to counted quantity
      await stockModel.setQuantity(client, productId, locationId, countedQty);

      // Create ledger entry
      const difference = countedQty - systemQty;
      await stockLedgerModel.insert(client, {
        productId,
        movementType: 'adjustment',
        quantity: difference,
        sourceLocationId: locationId,
        destLocationId: locationId,
        referenceType: 'adjustment',
        referenceId: adjustment.id,
        notes: `Adjustment: system=${systemQty}, counted=${countedQty}, diff=${difference}. ${reason || ''}`,
        createdBy: userId,
      });

      await client.query('COMMIT');
      return adjustment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = adjustmentService;
