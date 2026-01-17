const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');

// test route
router.get('/test', (req, res) => {
  res.json({ message: 'Equipment route working' });
});

// get all equipment
router.get('/', equipmentController.getAllEquipment);

// POST new equipment
router.post('/', equipmentController.createEquipment);

// PUT update equipment by ID
router.put('/:id', equipmentController.updateEquipment);

// DELETE equipment by ID
router.delete("/:id", equipmentController.deleteEquipment);

module.exports = router;
