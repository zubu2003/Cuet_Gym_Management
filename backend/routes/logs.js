const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const ActiveSession = require('../models/ActiveSession');

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get all logs (with filters)
router.get('/', async (req, res) => {
  const { search, date, type } = req.query;
  let query = {};
  if (search) query.$or = [{ studentName: { $regex: search, $options: 'i' } }, { studentId: { $regex: search, $options: 'i' } }];
  if (date) query.date = date;
  if (type && type !== 'all') query.type = type;
  const logs = await Log.find(query).sort({ timestamp: -1 });
  res.json(logs);
});

// Check IN
router.post('/entry', async (req, res) => {
  const { studentId, studentName } = req.body;
  const now = new Date();
  const date = getLocalDateString(now);
  const time = now.toLocaleTimeString();
  const hour = now.getHours();

  const existing = await ActiveSession.findOne({ studentId });
  if (existing) return res.status(400).json({ error: 'Already inside' });

  const log = new Log({ studentId, studentName, type: 'entry', date, time, hour });
  await log.save();

  const active = new ActiveSession({ studentId, studentName, entryTime: time, timestamp: now.getTime() });
  await active.save();

  res.json({ message: 'Checked IN', log });
});

// Check OUT
router.post('/exit', async (req, res) => {
  const { studentId, studentName } = req.body;
  const now = new Date();
  const date = getLocalDateString(now);
  const time = now.toLocaleTimeString();

  const active = await ActiveSession.findOne({ studentId });
  if (!active) return res.status(400).json({ error: 'Not inside' });

  const duration = Math.floor((now.getTime() - active.timestamp) / 60000);
  const log = new Log({ studentId, studentName, type: 'exit', date, time, duration });
  await log.save();
  await ActiveSession.findOneAndDelete({ studentId });

  res.json({ message: 'Checked OUT', log });
});

// Get currently inside
router.get('/active', async (req, res) => {
  const active = await ActiveSession.find();
  res.json(active);
});

// Force checkout
router.delete('/active/:studentId', async (req, res) => {
  const session = await ActiveSession.findOneAndDelete({ studentId: req.params.studentId });
  if (!session) return res.status(404).json({ error: 'Not found' });
  const now = new Date();
  const log = new Log({
    studentId: session.studentId,
    studentName: session.studentName,
    type: 'exit',
    date: getLocalDateString(now),
    time: now.toLocaleTimeString(),
    duration: Math.floor((now.getTime() - session.timestamp) / 60000),
    forced: true
  });
  await log.save();
  res.json({ message: 'Force checked out' });
});

module.exports = router;