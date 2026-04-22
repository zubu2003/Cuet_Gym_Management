const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  studentId: { type: String },      // Links to Student collection
  studentName: { type: String },    // Student name
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);