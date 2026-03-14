const pool = require('../config/db');
const receiptModel = require('../models/receiptModel');
const stockModel = require('../models/stockModel');
const stockLedgerModel = require('../models/stockLedgerModel');
const AppError = require('../utils/AppError');

const receiptService = {
  async createReceipt({ supplierName, warehouseId, items, notes, userId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const reference = await receiptModel.getNextReference();

      const receipt = await receiptModel.create(client, {
        reference, supplierName, warehouseId, notes, createdBy: userId,
      });

      for (const item of items) {
        await receiptModel.addItem(client, {
          receiptId: receipt.id,
          productId: item.productId,
          locationId: item.locationId,
          quantity: item.quantity,
        });
      }

      await client.query('COMMIT');
      return receipt;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async validateReceipt(receiptId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const receipt = await receiptModel.getForUpdate(client, receiptId);
      if (!receipt) throw new AppError('Receipt not found', 404, 'NOT_FOUND');
      if (receipt.status === 'done') throw new AppError('Receipt already validated', 400, 'ALREADY_DONE');
      if (receipt.status === 'cancelled') throw new AppError('Cannot validate cancelled receipt', 400, 'CANCELLED');

      const items = await receiptModel.getItems(client, receiptId);

      for (const item of items) {
        // Increase stock
        await stockModel.upsert(client, item.product_id, item.location_id, item.quantity);

        // Create ledger entry
        await stockLedgerModel.insert(client, {
          productId: item.product_id,
          movementType: 'receipt',
          quantity: item.quantity,
          destLocationId: item.location_id,
          referenceType: 'receipt',
          referenceId: receiptId,
          createdBy: userId,
        });
      }

      await receiptModel.updateStatus(client, receiptId, 'done', userId);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async cancelReceipt(receiptId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const receipt = await receiptModel.getForUpdate(client, receiptId);
      if (!receipt) throw new AppError('Receipt not found', 404, 'NOT_FOUND');
      if (receipt.status === 'done') throw new AppError('Cannot cancel a validated receipt', 400, 'ALREADY_DONE');
      await receiptModel.updateStatus(client, receiptId, 'cancelled');
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = receiptService;
