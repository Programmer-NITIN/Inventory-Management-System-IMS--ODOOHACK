const pool = require('../config/db');

const transferModel = {
  async findAll({ status, limit, offset }) {
    let query = `
      SELECT t.*, sw.name AS source_warehouse_name, dw.name AS dest_warehouse_name,
             u.display_name AS created_by_name
      FROM transfers t
      JOIN warehouses sw ON sw.id = t.source_warehouse_id
      JOIN warehouses dw ON dw.id = t.dest_warehouse_id
      LEFT JOIN users u ON u.id = t.created_by
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) { query += ` AND t.status = $${idx}`; params.push(status); idx++; }

    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*)::int AS total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = countResult.rows[0].total;

    query += ` ORDER BY t.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, total };
  },

  async findById(id) {
    const transfer = await pool.query(
      `SELECT t.*, sw.name AS source_warehouse_name, dw.name AS dest_warehouse_name
       FROM transfers t
       JOIN warehouses sw ON sw.id = t.source_warehouse_id
       JOIN warehouses dw ON dw.id = t.dest_warehouse_id
       WHERE t.id = $1`, [id]
    );
    if (!transfer.rows[0]) return null;

    const items = await pool.query(
      `SELECT ti.*, p.name AS product_name, p.sku,
              sl.name AS source_location_name, dl.name AS dest_location_name
       FROM transfer_items ti
       JOIN products p ON p.id = ti.product_id
       JOIN locations sl ON sl.id = ti.source_location_id
       JOIN locations dl ON dl.id = ti.dest_location_id
       WHERE ti.transfer_id = $1`, [id]
    );
    return { ...transfer.rows[0], items: items.rows };
  },

  async create(client, { reference, sourceWarehouseId, destWarehouseId, notes, createdBy }) {
    const result = await client.query(
      `INSERT INTO transfers (reference, source_warehouse_id, dest_warehouse_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reference, sourceWarehouseId, destWarehouseId, notes, createdBy]
    );
    return result.rows[0];
  },

  async addItem(client, { transferId, productId, sourceLocationId, destLocationId, quantity }) {
    const result = await client.query(
      `INSERT INTO transfer_items (transfer_id, product_id, source_location_id, dest_location_id, quantity)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [transferId, productId, sourceLocationId, destLocationId, quantity]
    );
    return result.rows[0];
  },

  async updateStatus(client, id, status) {
    const extra = status === 'done' ? ', completed_at = NOW()' : '';
    await client.query(`UPDATE transfers SET status = $1${extra} WHERE id = $2`, [status, id]);
  },

  async getItems(client, transferId) {
    const result = await client.query('SELECT * FROM transfer_items WHERE transfer_id = $1', [transferId]);
    return result.rows;
  },

  async getForUpdate(client, id) {
    const result = await client.query('SELECT * FROM transfers WHERE id = $1 FOR UPDATE', [id]);
    return result.rows[0] || null;
  },

  async getNextReference() {
    const result = await pool.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 5) AS INT)), 0) + 1 AS next FROM transfers WHERE reference LIKE 'TRF-%'"
    );
    return `TRF-${String(result.rows[0].next).padStart(5, '0')}`;
  },
};

module.exports = transferModel;
