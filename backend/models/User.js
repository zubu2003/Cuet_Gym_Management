const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  studentId: { type: String },      // Links to Student collection
  studentName: { type: String },    // Student name
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  if (!this.password) {
    return false;
  }

  // Backward compatibility for old plain-text records.
  if (!this.password.startsWith('$2')) {
    return this.password === candidatePassword;
  }

  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);