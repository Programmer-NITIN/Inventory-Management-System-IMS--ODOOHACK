const pool = require('./src/config/db');
async function main() {
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
  console.log('Low Stock from DB:', JSON.stringify(result.rows, null, 2));
  process.exit(0);
}
main();
