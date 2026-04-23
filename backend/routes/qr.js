const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const Log = require('../models/Log');
const ActiveSession = require('../models/ActiveSession');
const Student = require('../models/Student');
const { getDhakaDateTimeParts } = require('../utils/dhakaTime');

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

// Scan + toggle entry/exit (user scanning)
router.post('/scan', async (req, res) => {
  try {
    const { qrCode, studentId, studentName } = req.body;

    if (!qrCode || !studentId) {
      return res.status(400).json({ error: 'qrCode and studentId are required' });
    }

    const valid = await QRCode.findOne({ code: qrCode, expiresAt: { $gt: new Date() } });
    if (!valid) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired QR' });
    }

    const now = new Date();
    const { date, time, hour } = getDhakaDateTimeParts(now);

    const student = await Student.findOne({ studentId }).select('name');
    const resolvedStudentName = studentName || student?.name || 'Student';

    const active = await ActiveSession.findOne({ studentId });

    if (!active) {
      const entryLog = new Log({
        studentId,
        studentName: resolvedStudentName,
        type: 'entry',
        date,
        time,
        hour
      });
      await entryLog.save();

      const activeSession = new ActiveSession({
        studentId,
        studentName: resolvedStudentName,
        entryTime: time,
        timestamp: now.getTime()
      });
      await activeSession.save();

      const currentlyInside = await ActiveSession.countDocuments();
      return res.json({
        success: true,
        action: 'entry',
        message: 'Checked IN successfully',
        currentlyInside
      });
    }

    const duration = Math.floor((now.getTime() - active.timestamp) / 60000);
    const exitLog = new Log({
      studentId,
      studentName: active.studentName || resolvedStudentName,
      type: 'exit',
      date,
      time,
      duration
    });
    await exitLog.save();
    await ActiveSession.findOneAndDelete({ studentId });

    const currentlyInside = await ActiveSession.countDocuments();
    return res.json({
      success: true,
      action: 'exit',
      message: 'Checked OUT successfully',
      currentlyInside
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Scan failed' });
  }
});

module.exports = router;