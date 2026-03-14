const pool = require('../config/db');

const receiptModel = {
  async findAll({ status, warehouseId, limit, offset }) {
    let query = `
      SELECT r.*, w.name AS warehouse_name, u.display_name AS created_by_name
      FROM receipts r
      JOIN warehouses w ON w.id = r.warehouse_id
      LEFT JOIN users u ON u.id = r.created_by
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) {
      query += ` AND r.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (warehouseId) {
      query += ` AND r.warehouse_id = $${idx}`;
      params.push(warehouseId);
      idx++;
    }

    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*)::int AS total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = countResult.rows[0].total;

    query += ` ORDER BY r.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, total };
  },

  async findById(id) {
    const receipt = await pool.query(
      `SELECT r.*, w.name AS warehouse_name
       FROM receipts r JOIN warehouses w ON w.id = r.warehouse_id
       WHERE r.id = $1`,
      [id]
    );
    if (!receipt.rows[0]) return null;

    const items = await pool.query(
      `SELECT ri.*, p.name AS product_name, p.sku, l.name AS location_name
       FROM receipt_items ri
       JOIN products p ON p.id = ri.product_id
       JOIN locations l ON l.id = ri.location_id
       WHERE ri.receipt_id = $1`,
      [id]
    );

    return { ...receipt.rows[0], items: items.rows };
  },

  async create(client, { reference, supplierName, warehouseId, notes, createdBy }) {
    const result = await client.query(
      `INSERT INTO receipts (reference, supplier_name, warehouse_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reference, supplierName, warehouseId, notes, createdBy]
    );
    return result.rows[0];
  },

  async addItem(client, { receiptId, productId, locationId, quantity }) {
    const result = await client.query(
      `INSERT INTO receipt_items (receipt_id, product_id, location_id, quantity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [receiptId, productId, locationId, quantity]
    );
    return result.rows[0];
  },

  async updateStatus(client, id, status, validatedBy) {
    const extra = status === 'done' ? ', validated_by = $3, validated_at = NOW()' : '';
    const params = status === 'done' ? [status, id, validatedBy] : [status, id];
    await client.query(
      `UPDATE receipts SET status = $1${extra} WHERE id = $2`,
      params
    );
  },

  async getItems(client, receiptId) {
    const result = await client.query(
      'SELECT * FROM receipt_items WHERE receipt_id = $1',
      [receiptId]
    );
    return result.rows;
  },

  async getForUpdate(client, id) {
    const result = await client.query(
      'SELECT * FROM receipts WHERE id = $1 FOR UPDATE',
      [id]
    );
    return result.rows[0] || null;
  },

  async getNextReference() {
    const result = await pool.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 5) AS INT)), 0) + 1 AS next FROM receipts WHERE reference LIKE 'REC-%'"
    );
    const num = result.rows[0].next;
    return `REC-${String(num).padStart(5, '0')}`;
  },
};

module.exports = receiptModel;
