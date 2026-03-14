const pool = require('../config/db');

const stockLedgerModel = {
  async insert(client, { productId, movementType, quantity, sourceLocationId, destLocationId, referenceType, referenceId, notes, createdBy }) {
    await client.query(
      `INSERT INTO stock_ledger
       (product_id, movement_type, quantity, source_location_id, dest_location_id, reference_type, reference_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [productId, movementType, quantity, sourceLocationId || null, destLocationId || null, referenceType, referenceId, notes || null, createdBy]
    );
  },

  async findAll({ productId, movementType, limit, offset }) {
    let query = `
      SELECT sl.*, p.name AS product_name, p.sku,
             src.name AS source_location_name, dest.name AS dest_location_name,
             sw.name AS source_warehouse_name, dw.name AS dest_warehouse_name
      FROM stock_ledger sl
      JOIN products p ON p.id = sl.product_id
      LEFT JOIN locations src ON src.id = sl.source_location_id
      LEFT JOIN warehouses sw ON sw.id = src.warehouse_id
      LEFT JOIN locations dest ON dest.id = sl.dest_location_id
      LEFT JOIN warehouses dw ON dw.id = dest.warehouse_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (productId) {
      query += ` AND sl.product_id = $${idx}`;
      params.push(productId);
      idx++;
    }
    if (movementType) {
      query += ` AND sl.movement_type = $${idx}`;
      params.push(movementType);
      idx++;
    }

    // Count
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*)::int AS total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = countResult.rows[0].total;

    query += ` ORDER BY sl.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, total };
  },
};

module.exports = stockLedgerModel;
