require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit();
    }
    
    const admin = new User({
      username: 'admin',
      email: 'admin@cuet.ac.bd',
      password: 'admin123',
      role: 'admin',
      studentId: 'ADMIN001',
      studentName: 'System Administrator'
    });
    
    await admin.save();
    console.log('✅ Admin user created!');
    console.log('Email: admin@cuet.ac.bd');
    console.log('Password: admin123');
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

createAdmin();