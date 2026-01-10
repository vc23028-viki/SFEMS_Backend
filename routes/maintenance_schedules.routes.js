const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/maintenance_schedules.controller");

// GET all schedules
router.get("/", scheduleController.getAllSchedules);

// GET single schedule by ID
router.get("/:id", scheduleController.getScheduleById);

// POST create schedule
router.post("/", scheduleController.createSchedule);

// PUT update schedule
router.put("/:id", scheduleController.updateSchedule);

// DELETE schedule
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
