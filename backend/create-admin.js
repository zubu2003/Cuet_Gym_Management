require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const requiredEnv = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = new User({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, // plain text here; save() hashes it
      role: 'admin',
      studentId: process.env.ADMIN_STUDENT_ID || 'ADMIN001',
      studentName: process.env.ADMIN_NAME || 'System Administrator',
    });

    await admin.save();
    console.log('Admin user created:', admin.email);
    // Never log the password
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

createAdmin();