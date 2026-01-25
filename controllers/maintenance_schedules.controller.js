const db = require("../config/db");

// GET all schedules
exports.getAllSchedules = async (req, res) => {
  const sql = `
    SELECT ms.*, e.name AS equipment_name
    FROM maintenance_schedules ms
    JOIN equipment e ON ms.equipment_id = e.id
    ORDER BY ms.schedule_date ASC, ms.schedule_time ASC
  `;
  
  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// GET single schedule by ID
exports.getScheduleById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM maintenance_schedules WHERE id = $1";
  try {
    const result = await db.query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// POST - create new schedule
exports.createSchedule = async (req, res) => {
  const { equipment_id, schedule_date, schedule_time, task_description, status } = req.body;
  
  if (!equipment_id || !schedule_date || !task_description) {
    return res.status(400).json({ error: "Missing required fields: equipment_id, schedule_date, task_description" });
  }

  const sql = `
    INSERT INTO maintenance_schedules (equipment_id, schedule_date, schedule_time, task_description, status)
    VALUES ($1, $2, $3, $4, $5) RETURNING *
  `;
  try {
    const result = await db.query(sql, [
      equipment_id, 
      schedule_date, 
      schedule_time || null, 
      task_description, 
      status || 'Scheduled'
    ]);
    
    res.status(201).json({
      message: "Schedule created successfully",
      schedule: result.rows[0]
    });
  } catch (err) {
    console.error("Database error creating schedule:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// PUT - update schedule (SIMPLIFIED - only updates what's provided)
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { equipment_id, schedule_date, schedule_time, task_description, status } = req.body;

  try {
    console.log(`Updating schedule ID ${id} with:`, { equipment_id, schedule_date, schedule_time, task_description, status });

    // Build dynamic SQL based on what fields are provided
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (equipment_id !== undefined) {
      updates.push(`equipment_id = $${paramCount++}`);
      values.push(equipment_id);
    }
    if (schedule_date !== undefined) {
      updates.push(`schedule_date = $${paramCount++}`);
      values.push(schedule_date);
    }
    if (schedule_time !== undefined) {
      updates.push(`schedule_time = $${paramCount++}`);
      values.push(schedule_time);
    }
    if (task_description !== undefined) {
      updates.push(`task_description = $${paramCount++}`);
      values.push(task_description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    // If no fields to update, return error
    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Note: updated_at column doesn't exist in this table, so we skip it

    // Add ID to parameters
    values.push(id);

    const sql = `
      UPDATE maintenance_schedules
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    console.log("SQL Query:", sql);
    console.log("Parameters:", values);

    const result = await db.query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.status(200).json({ 
      message: "Schedule updated successfully",
      schedule: result.rows[0]
    });

  } catch (err) {
    console.error("Database error updating schedule:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};

// DELETE - remove schedule
exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM maintenance_schedules WHERE id = $1 RETURNING *";
  try {
    const result = await db.query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    res.status(200).json({ 
      message: "Schedule deleted successfully",
      schedule: result.rows[0]
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
};