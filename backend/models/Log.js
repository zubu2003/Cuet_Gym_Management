const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  type: { type: String, enum: ['entry', 'exit'], required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  hour: { type: Number },
  duration: { type: Number },
  forced: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);