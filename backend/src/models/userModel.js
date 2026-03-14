const pool = require('../config/db');

const userModel = {
  async findByFirebaseUid(firebaseUid) {
    const result = await pool.query(
      'SELECT id, firebase_uid, email, display_name, role, is_active FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );
    return result.rows[0] || null;
  },

  async create({ firebaseUid, email, displayName, role }) {
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, email, display_name, role)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [firebaseUid, email, displayName, role || 'staff']
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
};

module.exports = userModel;
