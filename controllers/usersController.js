const pool = require('../config/database.js');

const getUserProfile = async (req, res) => {
  try {
    const { uid, name, email } = req.user;

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [uid]
    );

    if (rows.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO users (firebase_uid, fullname, email) VALUES (?, ?, ?)',
        [uid, name, email]
      );
      return res.json({
        id: result.insertId,
        firebase_uid: uid,
        name,
        email
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('🔥 Error in getUserProfile:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { getUserProfile };
