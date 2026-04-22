const mongoose = require('mongoose');

const activeSessionSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  entryTime: { type: String, required: true },
  timestamp: { type: Number, required: true }
});

module.exports = mongoose.model('ActiveSession', activeSessionSchema);