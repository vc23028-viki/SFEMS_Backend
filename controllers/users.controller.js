const db = require("../config/db");

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const sql = "SELECT id, username, email, role, created_at FROM users ORDER BY id ASC";
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// GET single user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "SELECT id, username, email, role, created_at FROM users WHERE id = $1";
    const result = await db.query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// DELETE user by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const sql = "DELETE FROM users WHERE id = $1";
    const result = await db.query(sql, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// UPDATE user by ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;
  
  if (!username || !email || !role) {
    return res.status(400).json({ error: "username, email, and role are required" });
  }
  
  try {
    const sql = `
      UPDATE users
      SET username = $1, email = $2, role = $3
      WHERE id = $4
    `;
    const result = await db.query(sql, [username, email, role, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};