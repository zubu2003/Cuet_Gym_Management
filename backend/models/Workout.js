const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  equipment: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  duration: { type: Number, required: true },
  calories: { type: Number, required: true },
  date: { type: String, required: true },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', workoutSchema);