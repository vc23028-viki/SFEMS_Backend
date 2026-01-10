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
    res.status(200).json(result.rows);  // PostgreSQL returns rows in result.rows
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// GET single schedule by ID
exports.getScheduleById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM maintenance_schedules WHERE id = $1";  // PostgreSQL query parameter
  try {
    const result = await db.query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.status(200).json(result.rows[0]);  // PostgreSQL returns rows in result.rows
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// POST - create new schedule
exports.createSchedule = async (req, res) => {
  const { equipment_id, schedule_date, schedule_time, task_description, status } = req.body;
  if (!equipment_id || !schedule_date || !task_description || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO maintenance_schedules (equipment_id, schedule_date, schedule_time, task_description, status)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `;
  try {
    const result = await db.query(sql, [equipment_id, schedule_date, schedule_time || null, task_description, status]);
    res.status(201).json({
      message: "Schedule created successfully",
      scheduleId: result.rows[0].id // PostgreSQL returns the result in result.rows[0].id
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// PUT - update schedule
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { schedule_date, schedule_time, task_description, status } = req.body;
  if (!schedule_date || !task_description || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    UPDATE maintenance_schedules
    SET schedule_date = $1, schedule_time = $2, task_description = $3, status = $4
    WHERE id = $5
  `;
  try {
    const result = await db.query(sql, [schedule_date, schedule_time || null, task_description, status, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.status(200).json({ message: "Schedule updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// DELETE - remove schedule
exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM maintenance_schedules WHERE id = $1";
  try {
    const result = await db.query(sql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};
