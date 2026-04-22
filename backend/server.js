


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
connectDB();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes - MAKE SURE these are all correct
app.use('/api/students', require('./routes/students'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/workout', require('./routes/workout'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));