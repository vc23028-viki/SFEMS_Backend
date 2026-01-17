const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

// GET all users
router.get("/", usersController.getAllUsers);

// GET single user by ID
router.get("/:id", usersController.getUserById);

// DELETE user by ID
router.delete("/:id", usersController.deleteUser);

// UPDATE user by ID
router.put("/:id", usersController.updateUser);

module.exports = router;
