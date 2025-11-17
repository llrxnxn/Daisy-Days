// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { protect } = require('../middleware/auth');
const { profileUpload } = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @route   POST /api/auth/google-login
// @desc    Google Login (Firebase)
// @access  Public
router.post("/google-login", async (req, res) => {
  try {
    const { firebaseUid, name, email, photo } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Check if user exists by email
    let user = await User.findOne({ email });

    // CREATE USER IF NOT EXIST
    if (!user) {
      user = await User.create({
        firebaseUid,
        firstName: name?.split(" ")[0] || "",
        lastName: name?.split(" ")[1] || "",
        email,
        profileImage: photo,
        role: "customer",
        password: null, // Google accounts have no password
      });
    }

    // Check if account is deactivated
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated"
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Return same format as normal login
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during Google login",
      error: err.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (with image upload)
// @access  Private
router.put('/profile', protect, profileUpload.single('profileImage'), async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If new image uploaded, delete old one from Cloudinary
    if (req.file && user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    // Update profile image if uploaded
    if (req.file) {
      user.profileImage = req.file.path;
      user.cloudinaryId = req.file.filename;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/auth/profile-image
// @desc    Delete profile image
// @access  Private
router.delete('/profile-image', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete from Cloudinary
    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }

    // Remove from database
    user.profileImage = null;
    user.cloudinaryId = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;