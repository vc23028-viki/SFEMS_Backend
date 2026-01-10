const db = require("../config/db");

// GET all maintenance tasks
exports.getAllTasks = async (req, res) => {
  const sql = `
    SELECT mt.*, e.name AS equipment_name
    FROM maintenance_tasks mt
    JOIN equipment e ON mt.equipment_id = e.id
    ORDER BY mt.task_date ASC, mt.task_time ASC
  `;
  try {
    const result = await db.query(sql);
    res.status(200).json(result.rows); // PostgreSQL returns rows in result.rows
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// GET a single maintenance task by ID
exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM maintenance_tasks WHERE id = $1";  // PostgreSQL parameterized query
  try {
    const result = await db.query(sql, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(result.rows[0]); // PostgreSQL returns rows in result.rows
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// POST - create a new maintenance task
exports.createTask = async (req, res) => {
  const { equipment_id, task_date, task_time, description, status } = req.body;

  if (!equipment_id || !task_date || !description || !status) {
    return res.status(400).json({
      error: "Bad Request",
      message: "equipment_id, task_date, description, and status are required"
    });
  }

  const sql = `
    INSERT INTO maintenance_tasks (equipment_id, task_date, task_time, description, status)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `;
  try {
    const result = await db.query(sql, [equipment_id, task_date, task_time || null, description, status]);
    res.status(201).json({
      message: "Task created successfully",
      taskId: result.rows[0].id // PostgreSQL returns the result in result.rows[0].id
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// PUT - update a maintenance task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { task_date, task_time, description, status } = req.body;

  if (!task_date || !description || !status) {
    return res.status(400).json({
      error: "Bad Request",
      message: "task_date, description, and status are required"
    });
  }

  const sql = `
    UPDATE maintenance_tasks
    SET task_date = $1, task_time = $2, description = $3, status = $4
    WHERE id = $5
  `;
  try {
    const result = await db.query(sql, [task_date, task_time || null, description, status, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// DELETE - remove a maintenance task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM maintenance_tasks WHERE id = $1";
  try {
    const result = await db.query(sql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};
