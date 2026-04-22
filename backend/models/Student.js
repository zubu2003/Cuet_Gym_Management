const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);