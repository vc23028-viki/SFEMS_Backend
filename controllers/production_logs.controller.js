// controllers/production_logs.controller.js

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
    ORDER BY produced_at DESC
  `;

  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};

// POST - create new production log
exports.createProductionLog = async (req, res) => {
  const { equipment_id, production_count, produced_at } = req.body;

  // Validate required fields
  if (!equipment_id || production_count === undefined || production_count === null) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'equipment_id and production_count are required'
    });
  }

  try {
    const sql = `
      INSERT INTO production_logs (equipment_id, production_count, produced_at)
      VALUES ($1, $2, $3)
      RETURNING id, equipment_id, production_count, produced_at
    `;

    const result = await db.query(sql, [
      equipment_id,
      production_count,
      produced_at || new Date()
    ]);

    res.status(201).json({
      message: 'Production log created successfully',
      log: result.rows[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ 
      error: 'Database error',
      details: err.message
    });
  }
};

// PUT - update production log by ID
exports.updateProductionLog = async (req, res) => {
  const { id } = req.params;
  const { equipment_id, production_count, produced_at } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Production log ID is required' });
  }

  try {
    const sql = `
      UPDATE production_logs
      SET
        equipment_id = COALESCE($1, equipment_id),
        production_count = COALESCE($2, production_count),
        produced_at = COALESCE($3, produced_at)
      WHERE id = $4
      RETURNING id, equipment_id, production_count, produced_at
    `;

    const result = await db.query(sql, [
      equipment_id || null,
      production_count || null,
      produced_at || null,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Production log not found' });
    }

    res.status(200).json({ 
      message: 'Production log updated successfully',
      log: result.rows[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};

// DELETE - delete production log by ID
exports.deleteProductionLog = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = "DELETE FROM production_logs WHERE id = $1";
    const result = await db.query(sql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Production log not found' });
    }

    res.status(200).json({ message: 'Production log deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};