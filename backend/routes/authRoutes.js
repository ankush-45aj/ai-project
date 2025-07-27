const express = require('express');
const router = express.Router();
const { 
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword); // Use :token, not :resettoken

// Protected routes (require valid JWT)
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', protect, logout);

module.exports = router;