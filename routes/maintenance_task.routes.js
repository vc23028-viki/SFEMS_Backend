const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenance_task.controller");

// GET all tasks
router.get("/", maintenanceController.getAllTasks);

// GET task by ID
router.get("/:id", maintenanceController.getTaskById);

// POST create task
router.post("/", maintenanceController.createTask);

// PUT update task
router.put("/:id", maintenanceController.updateTask);

// DELETE task
router.delete("/:id", maintenanceController.deleteTask);

module.exports = router;
