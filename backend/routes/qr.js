const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');

// Generate new QR (admin)
router.post('/generate', async (req, res) => {
  const { interval = 30 } = req.body;
  const timestamp = Date.now();
  const token = Math.random().toString(36).substring(2, 15);
  const code = `GYM_ACCESS_${timestamp}_${token}`;
  const expiresAt = new Date(timestamp + interval * 1000);
  await QRCode.deleteMany({});
  const qr = new QRCode({ code, expiresAt });
  await qr.save();
  res.json({ qrCode: code, expiresAt });
});

// Get current QR (admin display)
router.get('/current', async (req, res) => {
  const qr = await QRCode.findOne({ expiresAt: { $gt: new Date() } });
  res.json({ qrCode: qr ? qr.code : null });
});

// Validate QR (user scanning)
router.post('/validate', async (req, res) => {
  const { qrCode } = req.body;
  const valid = await QRCode.findOne({ code: qrCode, expiresAt: { $gt: new Date() } });
  if (!valid) return res.status(400).json({ valid: false, error: 'Invalid or expired QR' });
  res.json({ valid: true });
});

module.exports = router;