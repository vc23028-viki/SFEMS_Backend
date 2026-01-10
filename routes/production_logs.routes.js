const express = require('express');
const router = express.Router();
const productionController = require('../controllers/production_logs.controller');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Production route working' });
});

// GET all production logs
router.get('/', productionController.getAllProductionLogs);

// PUT update production log
router.put('/:id', productionController.updateProductionLog);

module.exports = router;