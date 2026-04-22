const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

// Get all equipment (for admin)
router.get('/', async (req, res) => {
  const equipment = await Equipment.find();
  res.json(equipment);
});

// Get active equipment (for users - tutorial page)
router.get('/active', async (req, res) => {
  const equipment = await Equipment.find({ status: 'active' });
  res.json(equipment);
});

// Add equipment (admin)
router.post('/', async (req, res) => {
  const equipment = new Equipment(req.body);
  await equipment.save();
  res.json(equipment);
});

// Update equipment (admin)
router.put('/:id', async (req, res) => {
  const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(equipment);
});

// Delete equipment (admin)
router.delete('/:id', async (req, res) => {
  await Equipment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;