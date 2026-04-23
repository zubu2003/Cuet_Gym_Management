const mongoose = require('mongoose');

let cachedConnectionPromise = null;

const connectDB = async () => {
  if (cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  try {
    cachedConnectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false
    });
    await cachedConnectionPromise;
    console.log('MongoDB connected');
    return cachedConnectionPromise;
  } catch (err) {
    cachedConnectionPromise = null;
    console.error('DB Error:', err.message);
    throw err;
  }
};

module.exports = connectDB;