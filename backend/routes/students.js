const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Get all students
router.get('/', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// Add a student
router.post('/', async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json(student);
});

// Update student
router.put('/:studentId', async (req, res) => {
  const student = await Student.findOneAndUpdate(
    { studentId: req.params.studentId },
    req.body,
    { new: true }
  );
  res.json(student);
});

// Delete student
router.delete('/:studentId', async (req, res) => {
  await Student.findOneAndDelete({ studentId: req.params.studentId });
  res.json({ message: 'Deleted' });
});

module.exports = router;