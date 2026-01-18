// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Check if username exists
router.post('/check-username', authController.checkUsername);

// Check if email exists
router.post('/check-email', authController.checkEmail);

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

module.exports = router;