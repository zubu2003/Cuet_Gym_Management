const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');

// GET all equipment (for admin)
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET active equipment (for user tutorial page)
router.get('/active', async (req, res) => {
  try {
    const equipment = await Equipment.find({ status: 'active' });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add equipment
router.post('/', async (req, res) => {
  try {
    const { name, category, tutorial, instructions, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Equipment name is required' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const equipment = new Equipment({
      name: name.trim(),
      category,
      tutorial: tutorial ? tutorial.trim() : '',
      instructions: instructions ? instructions.trim() : '',
      status: status || 'active'
    });

    await equipment.save();
    res.status(201).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update equipment
router.put('/:id', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      name: req.body.name ? req.body.name.trim() : req.body.name,
      tutorial: req.body.tutorial ? req.body.tutorial.trim() : '',
      instructions: req.body.instructions ? req.body.instructions.trim() : ''
    };

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;