const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET a single student by ID
router.get('/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // Return all fields including email
    res.json({
      studentId: student.studentId,
      name: student.name,
      department: student.department,
      email: student.email,
      phone: student.phone || '',
      status: student.status,
      registeredAt: student.registeredAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add student
router.post('/', async (req, res) => {
  try {
    const existing = await Student.findOne({ studentId: req.body.studentId });
    if (existing) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    const student = new Student(req.body);
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put('/:studentId', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
      { 
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
        phone: req.body.phone
      },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:studentId', async (req, res) => {
  try {
    await Student.findOneAndDelete({ studentId: req.params.studentId });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;