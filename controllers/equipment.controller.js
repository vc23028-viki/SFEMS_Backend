const db = require('../config/db'); // This is your PostgreSQL connection pool

// GET all equipment
exports.getAllEquipment = async (req, res) => {
  const sql = 'SELECT * FROM equipment';

  try {
    const result = await db.query(sql);
    res.json(result.rows); // PostgreSQL returns rows as an array in result.rows
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};

// POST - add new equipment
exports.createEquipment = async (req, res) => {
  const { name, machine_type, status, last_maintenance, capacity } = req.body;

  if (!name || !machine_type || !status || !capacity) {
    return res.status(400).json({
      error: 'name, machine_type, status, and capacity are required'
    });
  }

  const sql = `
    INSERT INTO equipment 
    (name, machine_type, status, last_maintenance, capacity)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `;

  try {
    const result = await db.query(sql, [name, machine_type, status, last_maintenance || null, capacity]);
    res.status(201).json({
      message: 'Equipment added successfully',
      equipmentId: result.rows[0].id // PostgreSQL returns the result in result.rows[0].id
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};

// PUT - update equipment
exports.updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, machine_type, status, last_maintenance, capacity } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Equipment ID is required' });
  }

  const sql = `
    UPDATE equipment
    SET name = $1, machine_type = $2, status = $3, last_maintenance = $4, capacity = $5
    WHERE id = $6
  `;

  try {
    const result = await db.query(sql, [name, machine_type, status, last_maintenance || null, capacity, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({ message: 'Equipment updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
};
