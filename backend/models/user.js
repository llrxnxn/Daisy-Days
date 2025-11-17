// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // For Google login
  firebaseUid: {
    type: String,
    default: null,
  },

  // For Google OR manual signup
  firstName: {
    type: String,
    trim: true,
    default: null
  },
  lastName: {
    type: String,
    trim: true,
    default: null
  },

  name: {
    type: String,
    default: null // For Google (displayName)
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  phone: {
    type: String,
    default: null
  },

  // Only for email/password login — NOT required for Google
  password: {
    type: String,
    minlength: 6,
    select: false,
    default: null
  },

  profileImage: {
    type: String,
    default: null
  },
  
  cloudinaryId: {
    type: String,
    default: null
  },

  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});


// 🔐 Hash password only if it exists
userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();

  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


// Compare password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
