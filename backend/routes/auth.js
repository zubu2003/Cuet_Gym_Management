const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { authMiddleware } = require('../middleware/auth');

// LOGIN endpoint (works for both admin and student)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, studentId: user.studentId, studentName: user.studentName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        studentId: user.studentId,
        studentName: user.studentName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIGNUP endpoint (student signs up with their own student ID)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, studentId, studentName, department, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }
    
    // Check if student ID is already registered
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ error: 'This Student ID is already registered' });
    }
    
    // Create student record
    const student = new Student({
      studentId: studentId,
      name: studentName,
      department: department,
      email: email,
      phone: phone || '',
      status: 'active',
      registeredAt: new Date()
    });
    await student.save();
    
    // Create user account
    const user = new User({
      username,
      email,
      password,
      role: 'student',
      studentId: studentId,
      studentName: studentName
    });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, studentId: studentId, studentName: studentName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: 'student',
        studentId: studentId,
        studentName: studentName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET current user (protected route)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;