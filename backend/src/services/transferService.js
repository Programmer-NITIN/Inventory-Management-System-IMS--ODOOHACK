const pool = require('../config/db');
const transferModel = require('../models/transferModel');
const stockModel = require('../models/stockModel');
const stockLedgerModel = require('../models/stockLedgerModel');
const AppError = require('../utils/AppError');

const transferService = {
  async createTransfer({ sourceWarehouseId, destWarehouseId, items, notes, userId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const reference = await transferModel.getNextReference();

      const transfer = await transferModel.create(client, {
        reference, sourceWarehouseId, destWarehouseId, notes, createdBy: userId,
      });

      for (const item of items) {
        await transferModel.addItem(client, {
          transferId: transfer.id,
          productId: item.productId,
          sourceLocationId: item.sourceLocationId,
          destLocationId: item.destLocationId,
          quantity: item.quantity,
        });
      }

      await client.query('COMMIT');
      return transfer;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async completeTransfer(transferId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const transfer = await transferModel.getForUpdate(client, transferId);
      if (!transfer) throw new AppError('Transfer not found', 404, 'NOT_FOUND');
      if (transfer.status === 'done') throw new AppError('Transfer already completed', 400, 'ALREADY_DONE');
      if (transfer.status === 'cancelled') throw new AppError('Cannot complete cancelled transfer', 400, 'CANCELLED');

      const items = await transferModel.getItems(client, transferId);

      for (const item of items) {
        // Check sufficient stock at source
        const sourceQty = await stockModel.getQuantity(client, item.product_id, item.source_location_id);
        if (sourceQty < item.quantity) {
          throw new AppError(
            `Insufficient stock at source location for product ${item.product_id}. Available: ${sourceQty}, Requested: ${item.quantity}`,
            400, 'INSUFFICIENT_STOCK'
          );
        }

        // Decrease source
        await stockModel.upsert(client, item.product_id, item.source_location_id, -item.quantity);

        // Increase destination
        await stockModel.upsert(client, item.product_id, item.dest_location_id, item.quantity);

        // Ledger: transfer_out
        await stockLedgerModel.insert(client, {
          productId: item.product_id,
          movementType: 'transfer_out',
          quantity: -item.quantity,
          sourceLocationId: item.source_location_id,
          destLocationId: item.dest_location_id,
          referenceType: 'transfer',
          referenceId: transferId,
          createdBy: userId,
        });

        // Ledger: transfer_in
        await stockLedgerModel.insert(client, {
          productId: item.product_id,
          movementType: 'transfer_in',
          quantity: item.quantity,
          sourceLocationId: item.source_location_id,
          destLocationId: item.dest_location_id,
          referenceType: 'transfer',
          referenceId: transferId,
          createdBy: userId,
        });
      }

      await transferModel.updateStatus(client, transferId, 'done');
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = transferService;
