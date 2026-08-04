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

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const admin = await User.findOne({
      role: 'admin',
      email: process.env.ADMIN_EMAIL,
    });

    if (!admin) {
      console.error('Admin not found for email:', process.env.ADMIN_EMAIL);
      process.exit(1);
    }

    admin.password = process.env.ADMIN_PASSWORD;
    await admin.save();

    console.log('Admin password updated for:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

resetAdminPassword();
