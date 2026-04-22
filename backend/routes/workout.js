// backend/routes/workout.js
const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');

router.get('/:studentId', async (req, res) => {
  const workouts = await Workout.find({ studentId: req.params.studentId }).sort({ date: -1 });
  res.json(workouts);
});

router.post('/', async (req, res) => {
  const workout = new Workout(req.body);
  await workout.save();
  res.json(workout);
});

router.put('/:id', async (req, res) => {
  const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(workout);
});

router.delete('/:id', async (req, res) => {
  await Workout.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

router.get('/stats/:studentId', async (req, res) => {
  const workouts = await Workout.find({ studentId: req.params.studentId });
  const totalTime = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalWorkouts = workouts.length;
  res.json({ totalTime, totalCalories, totalWorkouts });
});

module.exports = router;