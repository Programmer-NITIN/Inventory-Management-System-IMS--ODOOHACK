const pool = require('../config/db');

const deliveryModel = {
  async findAll({ status, warehouseId, limit, offset }) {
    let query = `
      SELECT d.*, w.name AS warehouse_name, u.display_name AS created_by_name
      FROM deliveries d
      JOIN warehouses w ON w.id = d.warehouse_id
      LEFT JOIN users u ON u.id = d.created_by
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND d.status = $${idx}`; params.push(status); idx++; }
    if (warehouseId) { query += ` AND d.warehouse_id = $${idx}`; params.push(warehouseId); idx++; }

    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*)::int AS total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = countResult.rows[0].total;

    query += ` ORDER BY d.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, total };
  },

  async findById(id) {
    const delivery = await pool.query(
      `SELECT d.*, w.name AS warehouse_name FROM deliveries d
       JOIN warehouses w ON w.id = d.warehouse_id WHERE d.id = $1`, [id]
    );
    if (!delivery.rows[0]) return null;

    const items = await pool.query(
      `SELECT di.*, p.name AS product_name, p.sku, l.name AS location_name
       FROM delivery_items di
       JOIN products p ON p.id = di.product_id
       JOIN locations l ON l.id = di.location_id
       WHERE di.delivery_id = $1`, [id]
    );
    return { ...delivery.rows[0], items: items.rows };
  },

  async create(client, { reference, customerName, warehouseId, notes, createdBy }) {
    const result = await client.query(
      `INSERT INTO deliveries (reference, customer_name, warehouse_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reference, customerName, warehouseId, notes, createdBy]
    );
    return result.rows[0];
  },

  async addItem(client, { deliveryId, productId, locationId, quantity }) {
    const result = await client.query(
      `INSERT INTO delivery_items (delivery_id, product_id, location_id, quantity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [deliveryId, productId, locationId, quantity]
    );
    return result.rows[0];
  },

  async updateStatus(client, id, status, validatedBy) {
    const extra = status === 'done' ? ', validated_by = $3, validated_at = NOW()' : '';
    const params = status === 'done' ? [status, id, validatedBy] : [status, id];
    await client.query(`UPDATE deliveries SET status = $1${extra} WHERE id = $2`, params);
  },

  async getItems(client, deliveryId) {
    const result = await client.query('SELECT * FROM delivery_items WHERE delivery_id = $1', [deliveryId]);
    return result.rows;
  },

  async getForUpdate(client, id) {
    const result = await client.query('SELECT * FROM deliveries WHERE id = $1 FOR UPDATE', [id]);
    return result.rows[0] || null;
  },

  async getNextReference() {
    const result = await pool.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 5) AS INT)), 0) + 1 AS next FROM deliveries WHERE reference LIKE 'DEL-%'"
    );
    return `DEL-${String(result.rows[0].next).padStart(5, '0')}`;
  },
};

module.exports = deliveryModel;
