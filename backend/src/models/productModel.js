const pool = require('../config/db');

const productModel = {
  async findAll({ search, categoryId, limit, offset }) {
    let query = `
      SELECT p.*, c.name AS category_name,
             COALESCE(SUM(s.quantity), 0)::int AS total_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN stock s ON s.product_id = p.id
      WHERE p.is_active = true
    `;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (p.name ILIKE $${idx} OR p.sku ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (categoryId) {
      query += ` AND p.category_id = $${idx}`;
      params.push(categoryId);
      idx++;
    }

    query += ' GROUP BY p.id, c.name ORDER BY p.name';

    // Count total
    const countQuery = `SELECT COUNT(DISTINCT p.id)::int AS total FROM products p WHERE p.is_active = true${
      search ? ` AND (p.name ILIKE $1 OR p.sku ILIKE $1)` : ''
    }${categoryId ? ` AND p.category_id = $${search ? 2 : 1}` : ''}`;
    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (categoryId) countParams.push(categoryId);

    const countResult = await pool.query(countQuery, countParams);
    const total = countResult.rows[0].total;

    query += ` LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { data: result.rows, total };
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async getStockByProduct(productId) {
    const result = await pool.query(
      `SELECT s.*, l.name AS location_name, w.name AS warehouse_name
       FROM stock s
       JOIN locations l ON l.id = s.location_id
       JOIN warehouses w ON w.id = l.warehouse_id
       WHERE s.product_id = $1
       ORDER BY w.name, l.name`,
      [productId]
    );
    return result.rows;
  },

  async create({ name, sku, categoryId, unit, reorderLevel, description }) {
    const result = await pool.query(
      `INSERT INTO products (name, sku, category_id, unit, reorder_level, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, sku, categoryId, unit || 'units', reorderLevel || 0, description]
    );
    return result.rows[0];
  },

  async update(id, { name, sku, categoryId, unit, reorderLevel, description }) {
    const result = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         sku = COALESCE($2, sku),
         category_id = COALESCE($3, category_id),
         unit = COALESCE($4, unit),
         reorder_level = COALESCE($5, reorder_level),
         description = COALESCE($6, description),
         updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name, sku, categoryId, unit, reorderLevel, description, id]
    );
    return result.rows[0];
  },

  async softDelete(id) {
    const result = await pool.query(
      'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

module.exports = productModel;
