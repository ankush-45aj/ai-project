const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Utility: Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Utility: Send Email (returns promise)
const sendEmail = (options) => {
  return new Promise((resolve, reject) => {
    // In production: Implement with Nodemailer/SendGrid
    console.log('Email sent:', options);
    resolve(); // Simulate successful email send
  });
};

// @desc    Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
    }

    // Create user
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: user,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// @desc    Forgot password (send reset token via email)
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Always return success to prevent email enumeration
    const genericResponse = {
      success: true,
      message: 'If your email is registered, you will receive a reset token',
    };

    if (!user) return res.status(200).json(genericResponse);

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });

    try {
      // Send email
      await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        message: `Use this token to reset your password: ${resetToken}`,
        resetUrl: `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`,
      });

      res.status(200).json(genericResponse);
    } catch (emailErr) {
      // Reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        success: false,
        error: 'Email could not be sent',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Reset password
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    // Validate password length
    if (req.body.password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
    }

    // Update password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({ 
      success: true, 
      token,
      message: 'Password updated successfully' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update user password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Validate current password
    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Validate new password length
    if (req.body.newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ 
      success: true, 
      token,
      message: 'Password updated successfully' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


// @desc    Get current user
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

// @desc    Logout user
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
};

// @desc    Update user details
exports.updateDetails = async (req, res) => {
  res.status(200).json({ success: true, message: 'User details updated' });
};