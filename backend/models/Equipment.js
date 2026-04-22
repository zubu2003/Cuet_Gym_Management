const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Cardio', 'Strength', 'Free Weights', 'Cable'], required: true },
  tutorial: { type: String, default: '' },
  instructions: { type: String, default: '' },
  status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Equipment', equipmentSchema);