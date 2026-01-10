const db = require("../config/db");

// GET all production logs
exports.getAllProductionLogs = async (req, res) => {
  const sql = `
    SELECT 
      id,
      equipment_id,
      production_count,
      produced_at
    FROM production_logs
  `;

  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows);  // PostgreSQL returns rows in result.rows
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};

// PUT - update production log by ID
exports.updateProductionLog = async (req, res) => {
  const { id } = req.params;
  const { equipment_id, production_count, produced_at } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Production log ID is required' });
  }

  const sql = `
    UPDATE production_logs
    SET
      equipment_id = $1,
      production_count = $2,
      produced_at = $3
    WHERE id = $4
    RETURNING *  -- Returns updated record
  `;

  try {
    const result = await db.query(sql, [equipment_id, production_count, produced_at, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Production log not found' });
    }

    res.status(200).json({ message: 'Production log updated successfully', updatedLog: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};
