const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../services/twilio');
const { protect, admin } = require('../middleware/auth');
const { googleAuth, googleAuthCallback } = require('../services/auth/google');

// Send OTP
router.post('/send-otp', sendOtp);

// Verify OTP
router.post('/verify-otp', verifyOtp);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

module.exports = router;