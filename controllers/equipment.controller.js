// backend/controllers/equipment.controller.js - FIXED UPDATE

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
      RETURNING *
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

// PUT - update equipment by ID (FIXED)
exports.updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, machine_type, status, last_maintenance, capacity } = req.body;

  try {
    console.log('Update request for equipment ID:', id);
    console.log('Received data:', { name, machine_type, status, last_maintenance, capacity });

    // Validate required fields
    if (!name || !machine_type || !status) {
      return res.status(400).json({
        error: 'name, machine_type, and status are required'
      });
    }

    const sql = `
      UPDATE equipment
      SET name = $1,
          machine_type = $2,
          status = $3,
          last_maintenance = $4,
          capacity = $5
      WHERE id = $6
      RETURNING *
    `;

    const result = await db.query(sql, [
      name,
      machine_type,
      status,
      last_maintenance || null,
      capacity || 0,
      id
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    console.log('Equipment updated successfully:', result.rows[0]);
    
    res.status(200).json({ 
      message: 'Equipment updated successfully',
      equipment: result.rows[0]
    });
  } catch (err) {
    console.error('Database error updating equipment:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

// DELETE - delete equipment by ID (FIXED with CASCADE delete)
exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();

  try {
    console.log(`Deleting equipment ID: ${id}`);

    // Start transaction
    await client.query('BEGIN');

    // Delete related production_logs
    await client.query('DELETE FROM production_logs WHERE equipment_id = $1', [id]);
    console.log('Deleted production logs');

    // Delete related maintenance_tasks
    await client.query('DELETE FROM maintenance_tasks WHERE equipment_id = $1', [id]);
    console.log('Deleted maintenance tasks');

    // Delete related maintenance_schedules
    await client.query('DELETE FROM maintenance_schedules WHERE equipment_id = $1', [id]);
    console.log('Deleted maintenance schedules');

    // Finally, delete the equipment
    const result = await client.query(
      'DELETE FROM equipment WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log(`Successfully deleted equipment ID: ${id}`);

    res.status(200).json({ 
      message: 'Equipment deleted successfully',
      equipment: result.rows[0]
    });
  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK').catch(e => console.error('Rollback error:', e));
    
    console.error('Error deleting equipment:', err);
    res.status(500).json({ error: 'Failed to delete equipment', details: err.message });
  } finally {
    client.release();
  }
};