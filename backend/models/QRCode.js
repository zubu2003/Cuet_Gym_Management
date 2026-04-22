const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);