const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Log = require('../models/Log');
const ActiveSession = require('../models/ActiveSession');

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
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

// DELETE student (admin only)
router.delete('/:studentId', async (req, res) => {
  try {
    await Student.findOneAndDelete({ studentId: req.params.studentId });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DELETE COMPLETE ACCOUNT (Student self-delete) ==========
router.delete('/account/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { password } = req.body;
    
    // Find user account to verify password
    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    // Delete student record
    const student = await Student.findOneAndDelete({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Delete user account
    await User.findOneAndDelete({ studentId });
    
    // Delete all workouts
    await Workout.deleteMany({ studentId });
    
    // Delete all logs (entry/exit)
    await Log.deleteMany({ studentId });
    
    // Remove from active sessions if inside
    await ActiveSession.findOneAndDelete({ studentId });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;