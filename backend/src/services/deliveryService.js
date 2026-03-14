const pool = require('../config/db');
const deliveryModel = require('../models/deliveryModel');
const stockModel = require('../models/stockModel');
const stockLedgerModel = require('../models/stockLedgerModel');
const AppError = require('../utils/AppError');

const deliveryService = {
  async createDelivery({ customerName, warehouseId, items, notes, userId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const reference = await deliveryModel.getNextReference();

      const delivery = await deliveryModel.create(client, {
        reference, customerName, warehouseId, notes, createdBy: userId,
      });

      for (const item of items) {
        await deliveryModel.addItem(client, {
          deliveryId: delivery.id,
          productId: item.productId,
          locationId: item.locationId,
          quantity: item.quantity,
        });
      }

      await client.query('COMMIT');
      return delivery;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async validateDelivery(deliveryId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const delivery = await deliveryModel.getForUpdate(client, deliveryId);
      if (!delivery) throw new AppError('Delivery not found', 404, 'NOT_FOUND');
      if (delivery.status === 'done') throw new AppError('Delivery already validated', 400, 'ALREADY_DONE');
      if (delivery.status === 'cancelled') throw new AppError('Cannot validate cancelled delivery', 400, 'CANCELLED');

      const items = await deliveryModel.getItems(client, deliveryId);

      for (const item of items) {
        // Check sufficient stock
        const currentQty = await stockModel.getQuantity(client, item.product_id, item.location_id);
        if (currentQty < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${item.product_id} at location ${item.location_id}. Available: ${currentQty}, Requested: ${item.quantity}`,
            400, 'INSUFFICIENT_STOCK'
          );
        }

        // Decrease stock
        await stockModel.upsert(client, item.product_id, item.location_id, -item.quantity);

        // Create ledger entry
        await stockLedgerModel.insert(client, {
          productId: item.product_id,
          movementType: 'delivery',
          quantity: -item.quantity,
          sourceLocationId: item.location_id,
          referenceType: 'delivery',
          referenceId: deliveryId,
          createdBy: userId,
        });
      }

      await deliveryModel.updateStatus(client, deliveryId, 'done', userId);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async cancelDelivery(deliveryId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const delivery = await deliveryModel.getForUpdate(client, deliveryId);
      if (!delivery) throw new AppError('Delivery not found', 404, 'NOT_FOUND');
      if (delivery.status === 'done') throw new AppError('Cannot cancel a validated delivery', 400, 'ALREADY_DONE');
      await deliveryModel.updateStatus(client, deliveryId, 'cancelled');
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = deliveryService;
