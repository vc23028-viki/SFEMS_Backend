const db = require('../config/db');

// GET all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const sql = 'SELECT * FROM equipment ORDER BY id ASC';
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
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

  try {
    const sql = `
      INSERT INTO equipment 
      (name, machine_type, status, last_maintenance, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await db.query(sql, [
      name,
      machine_type,
      status,
      last_maintenance || null,
      capacity
    ]);

    res.status(201).json({
      message: 'Equipment added successfully',
      equipmentId: result.rows[0].id
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// PUT - update equipment by ID
exports.updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, machine_type, status, last_maintenance, capacity } = req.body;

  if (!name || !machine_type || !status || !capacity) {
    return res.status(400).json({
      error: 'name, machine_type, status, and capacity are required'
    });
  }

  try {
    const sql = `
      UPDATE equipment
      SET name = $1,
          machine_type = $2,
          status = $3,
          last_maintenance = $4,
          capacity = $5
      WHERE id = $6
    `;

    const result = await db.query(sql, [
      name,
      machine_type,
      status,
      last_maintenance || null,
      capacity,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.status(200).json({ message: 'Equipment updated successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE - delete equipment by ID
exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM equipment WHERE id = $1';
    const result = await db.query(sql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
