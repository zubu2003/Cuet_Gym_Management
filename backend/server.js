


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
connectDB().catch((error) => {
  console.error('Initial DB connection failed:', error.message);
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (error) {
    return res.status(500).json({
      error: 'Database connection failed. Please try again.'
    });
  }
});

// Routes - MAKE SURE these are all correct
app.use('/api/students', require('./routes/students'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/workout', require('./routes/workout'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/auth'));

module.exports = app;

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
}