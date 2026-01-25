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
          capacity = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
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

    res.status(200).json({ 
      message: 'Equipment updated successfully',
      equipment: result.rows[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE - delete equipment by ID (FIXED with CASCADE delete)
exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    console.log(`Deleting equipment ID: ${id}`);

    // Step 1: Delete all related production_logs
    const delProduction = await client.query(
      'DELETE FROM production_logs WHERE equipment_id = $1',
      [id]
    );
    console.log(`Deleted ${delProduction.rowCount} production log(s)`);

    // Step 2: Delete all related maintenance_tasks
    const delTasks = await client.query(
      'DELETE FROM maintenance_tasks WHERE equipment_id = $1',
      [id]
    );
    console.log(`Deleted ${delTasks.rowCount} maintenance task(s)`);

    // Step 3: Delete all related maintenance_schedules
    const delSchedules = await client.query(
      'DELETE FROM maintenance_schedules WHERE equipment_id = $1',
      [id]
    );
    console.log(`Deleted ${delSchedules.rowCount} maintenance schedule(s)`);

    // Step 4: Finally delete the equipment
    const delEquipment = await client.query(
      'DELETE FROM equipment WHERE id = $1 RETURNING *',
      [id]
    );

    // Check if equipment was found
    if (delEquipment.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Commit all changes
    await client.query('COMMIT');

    console.log(`Successfully deleted equipment ID: ${id}`);

    res.status(200).json({ 
      message: 'Equipment deleted successfully',
      deletedEquipment: delEquipment.rows[0]
    });

  } catch (err) {
    // Rollback on any error
    await client.query('ROLLBACK').catch(e => console.error('Rollback error:', e));
    
    console.error('Error deleting equipment:', err);
    
    // Check for specific error types
    if (err.code === '23503') {
      return res.status(409).json({ 
        error: 'Cannot delete equipment with associated records',
        details: 'Please delete related tasks and schedules first'
      });
    }
    
    res.status(500).json({ error: 'Failed to delete equipment', details: err.message });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};