const pool = require('../config/db');

const stockModel = {
  async getAll({ productId, warehouseId, limit, offset }) {
    let query = `
      SELECT s.*, p.name AS product_name, p.sku, l.name AS location_name, w.name AS warehouse_name
      FROM stock s
      JOIN products p ON p.id = s.product_id
      JOIN locations l ON l.id = s.location_id
      JOIN warehouses w ON w.id = l.warehouse_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (productId) {
      query += ` AND s.product_id = $${idx}`;
      params.push(productId);
      idx++;
    }
    if (warehouseId) {
      query += ` AND l.warehouse_id = $${idx}`;
      params.push(warehouseId);
      idx++;
    }

    query += ' ORDER BY w.name, p.name';
    query += ` LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  /** Upsert stock (used inside transactions via client) */
  async upsert(client, productId, locationId, quantityChange) {
    await client.query(
      `INSERT INTO stock (product_id, location_id, quantity)
       VALUES ($1, $2, GREATEST(0, $3))
       ON CONFLICT (product_id, location_id)
       DO UPDATE SET quantity = stock.quantity + $3, updated_at = NOW()`,
      [productId, locationId, quantityChange]
    );
  },

  async getQuantity(client, productId, locationId) {
    const result = await client.query(
      'SELECT quantity FROM stock WHERE product_id = $1 AND location_id = $2 FOR UPDATE',
      [productId, locationId]
    );
    return result.rows[0]?.quantity || 0;
  },

  async setQuantity(client, productId, locationId, newQuantity) {
    await client.query(
      `INSERT INTO stock (product_id, location_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, location_id)
       DO UPDATE SET quantity = $3, updated_at = NOW()`,
      [productId, locationId, newQuantity]
    );
  },
};

module.exports = stockModel;
