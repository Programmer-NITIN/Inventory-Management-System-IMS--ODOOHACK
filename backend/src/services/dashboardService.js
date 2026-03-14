const pool = require('../config/db');

const dashboardService = {
  async getKPIs() {
    const queries = {
      totalProducts: `SELECT COUNT(*)::int AS value FROM products WHERE is_active = true`,
      lowStock: `
        SELECT COUNT(*)::int AS value FROM (
          SELECT p.id FROM products p
          LEFT JOIN stock s ON s.product_id = p.id
          WHERE p.is_active = true AND p.reorder_level > 0
          GROUP BY p.id, p.reorder_level
          HAVING COALESCE(SUM(s.quantity), 0) <= p.reorder_level
        ) sub
      `,
      outOfStock: `
        SELECT COUNT(*)::int AS value FROM (
          SELECT p.id FROM products p
          LEFT JOIN stock s ON s.product_id = p.id
          WHERE p.is_active = true
          GROUP BY p.id
          HAVING COALESCE(SUM(s.quantity), 0) = 0
        ) sub
      `,
      pendingReceipts: `SELECT COUNT(*)::int AS value FROM receipts WHERE status IN ('draft','waiting','ready')`,
      pendingDeliveries: `SELECT COUNT(*)::int AS value FROM deliveries WHERE status IN ('draft','waiting','ready')`,
      scheduledTransfers: `SELECT COUNT(*)::int AS value FROM transfers WHERE status IN ('draft','waiting','ready')`,
    };

    const results = {};
    for (const [key, sql] of Object.entries(queries)) {
      const result = await pool.query(sql);
      results[key] = result.rows[0].value;
    }
    return results;
  },

  async getCategoryDistribution() {
    const result = await pool.query(`
      SELECT c.name AS category, COALESCE(SUM(s.quantity), 0)::int AS total_stock
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
      LEFT JOIN stock s ON s.product_id = p.id
      GROUP BY c.id, c.name
      ORDER BY total_stock DESC
    `);
    return result.rows;
  },

  async getStockMovement(days = 30) {
    const result = await pool.query(`
      SELECT DATE(created_at) AS date, movement_type, SUM(ABS(quantity))::int AS total_qty
      FROM stock_ledger
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at), movement_type
      ORDER BY date
    `, [days]);
    return result.rows;
  },

  async getWarehouseUtilization() {
    const result = await pool.query(`
      SELECT w.name AS warehouse, COALESCE(SUM(s.quantity), 0)::int AS total_stock
      FROM warehouses w
      LEFT JOIN locations l ON l.warehouse_id = w.id
      LEFT JOIN stock s ON s.location_id = l.id
      WHERE w.is_active = true
      GROUP BY w.id, w.name
      ORDER BY total_stock DESC
    `);
    return result.rows;
  },

  async getLowStockProducts() {
    const result = await pool.query(`
      SELECT p.name, p.sku, p.unit, p.reorder_level,
             COALESCE(SUM(s.quantity), 0)::int AS total_stock
      FROM products p
      LEFT JOIN stock s ON s.product_id = p.id
      WHERE p.is_active = true AND p.reorder_level > 0
      GROUP BY p.id, p.name, p.sku, p.unit, p.reorder_level
      HAVING COALESCE(SUM(s.quantity), 0) <= p.reorder_level
      ORDER BY COALESCE(SUM(s.quantity), 0) ASC
    `);
    return result.rows;
  },
};

module.exports = dashboardService;
