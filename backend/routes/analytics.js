const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Log = require('../models/Log');
const ActiveSession = require('../models/ActiveSession');
const Workout = require('../models/Workout');

// Dashboard stats (cards on admin dashboard)
router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = await Log.countDocuments({ date: today, type: 'entry' });
    const activeSessions = await ActiveSession.find();
    const exits = await Log.find({ type: 'exit', duration: { $ne: null } });
    const avgDuration = exits.length 
      ? Math.round(exits.reduce((sum, l) => sum + l.duration, 0) / exits.length) 
      : 0;
    
    res.json({
      totalStudents,
      todayEntries,
      currentlyInside: activeSessions.length,
      avgDuration,
      activeSessions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Weekly usage (for the weekly list on dashboard)
router.get('/weekly', async (req, res) => {
  try {
    const logs = await Log.find({ type: 'entry' });
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    logs.forEach(log => {
      const date = new Date(log.date);
      let dayIndex = date.getDay(); // 0 = Sunday
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // convert to Monday = 0
      if (dayIndex >= 0 && dayIndex < 7) counts[dayIndex]++;
    });
    
    res.json({ days, counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Most active users (by number of visits)
router.get('/most-active', async (req, res) => {
  try {
    const logs = await Log.find({ type: 'exit', duration: { $ne: null } });
    const userMap = new Map();
    
    logs.forEach(log => {
      if (!userMap.has(log.studentId)) {
        userMap.set(log.studentId, {
          name: log.studentName,
          id: log.studentId,
          visits: 0,
          totalHours: 0
        });
      }
      const user = userMap.get(log.studentId);
      user.visits++;
      user.totalHours += log.duration / 60;
    });
    
    const sorted = Array.from(userMap.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
    
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Peak hours distribution (for analytics page)
router.get('/peak-hours', async (req, res) => {
  try {
    const logs = await Log.find({ type: 'entry', hour: { $ne: null } });
    const hourCounts = new Array(24).fill(0);
    
    logs.forEach(log => {
      if (log.hour !== undefined && log.hour >= 0 && log.hour < 24) {
        hourCounts[log.hour]++;
      }
    });
    
    const peakData = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    
    res.json(peakData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily attendance for last 14 days (for analytics page)
router.get('/daily-attendance', async (req, res) => {
  try {
    const logs = await Log.find({ type: 'entry' });
    const dailyMap = new Map();
    
    logs.forEach(log => {
      const count = dailyMap.get(log.date) || 0;
      dailyMap.set(log.date, count + 1);
    });
    
    const sorted = Array.from(dailyMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 14)
      .map(([date, count]) => ({ date, count }));
    
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;