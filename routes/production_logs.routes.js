// routes/production_logs.routes.js

const express = require('express');
const router = express.Router();
const productionController = require('../controllers/production_logs.controller');

// GET all production logs
router.get('/', productionController.getAllProductionLogs);

// POST - create new production log
router.post('/', productionController.createProductionLog);

// PUT - update production log by ID
router.put('/:id', productionController.updateProductionLog);

// DELETE - delete production log by ID
router.delete('/:id', productionController.deleteProductionLog);

module.exports = router;