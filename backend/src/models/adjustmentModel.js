const pool = require('../config/db');

const adjustmentModel = {
  async findAll({ limit, offset }) {
    const countResult = await pool.query('SELECT COUNT(*)::int AS total FROM adjustments');
    const total = countResult.rows[0].total;

    const result = await pool.query(
      `SELECT a.*, p.name AS product_name, p.sku, l.name AS location_name,
              w.name AS warehouse_name, u.display_name AS created_by_name
       FROM adjustments a
       JOIN products p ON p.id = a.product_id
       JOIN locations l ON l.id = a.location_id
       JOIN warehouses w ON w.id = l.warehouse_id
       LEFT JOIN users u ON u.id = a.created_by
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { data: result.rows, total };
  },

  async create(client, { reference, productId, locationId, systemQty, countedQty, reason, createdBy }) {
    const result = await client.query(
      `INSERT INTO adjustments (reference, product_id, location_id, system_qty, counted_qty, reason, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [reference, productId, locationId, systemQty, countedQty, reason, createdBy]
    );
    return result.rows[0];
  },

  async getNextReference() {
    const result = await pool.query(
      "SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 5) AS INT)), 0) + 1 AS next FROM adjustments WHERE reference LIKE 'ADJ-%'"
    );
    return `ADJ-${String(result.rows[0].next).padStart(5, '0')}`;
  },
};

module.exports = adjustmentModel;
