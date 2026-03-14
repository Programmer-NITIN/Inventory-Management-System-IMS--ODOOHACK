const pool = require('../config/db');

const userModel = {
  async findByFirebaseUid(firebaseUid) {
    const result = await pool.query(
      'SELECT id, firebase_uid, email, display_name, role, is_active, created_at FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );
    return result.rows[0] || null;
  },

  async create({ firebaseUid, email, displayName, role }) {
    // New staff users start as inactive (need manager approval)
    // New managers start as active
    const isActive = (role === 'manager');
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, email, display_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firebaseUid, email, displayName, role || 'staff', isActive]
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const { displayName, role, isActive } = fields;
    const result = await pool.query(
      `UPDATE users SET display_name = COALESCE($1, display_name),
       role = COALESCE($2, role), is_active = COALESCE($3, is_active),
       updated_at = NOW() WHERE id = $4 RETURNING *`,
      [displayName, role, isActive, id]
    );
    return result.rows[0];
  },

  async findAllStaff() {
    const result = await pool.query(
      `SELECT id, email, display_name, role, is_active, created_at
       FROM users WHERE role = 'staff' ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async setActive(id, isActive) {
    const result = await pool.query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isActive, id]
    );
    return result.rows[0];
  },
};

module.exports = userModel;
