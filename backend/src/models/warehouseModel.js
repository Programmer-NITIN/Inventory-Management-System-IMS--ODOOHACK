const pool = require('../config/db');

const warehouseModel = {
  async findAll() {
    const result = await pool.query(
      'SELECT * FROM warehouses WHERE is_active = true ORDER BY name'
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM warehouses WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ name, address }) {
    const result = await pool.query(
      'INSERT INTO warehouses (name, address) VALUES ($1, $2) RETURNING *',
      [name, address]
    );
    return result.rows[0];
  },

  async update(id, { name, address, isActive }) {
    const result = await pool.query(
      `UPDATE warehouses SET
         name = COALESCE($1, name),
         address = COALESCE($2, address),
         is_active = COALESCE($3, is_active)
       WHERE id = $4 RETURNING *`,
      [name, address, isActive, id]
    );
    return result.rows[0];
  },
};

const locationModel = {
  async findByWarehouse(warehouseId) {
    const result = await pool.query(
      'SELECT * FROM locations WHERE warehouse_id = $1 ORDER BY name',
      [warehouseId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM locations WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create({ warehouseId, name, description }) {
    const result = await pool.query(
      'INSERT INTO locations (warehouse_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [warehouseId, name, description]
    );
    return result.rows[0];
  },
};

module.exports = { warehouseModel, locationModel };
