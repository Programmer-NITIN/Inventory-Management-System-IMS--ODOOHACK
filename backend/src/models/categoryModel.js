const pool = require('../config/db');

const categoryModel = {
  async findAll() {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ name, description }) {
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  },
};

module.exports = categoryModel;
