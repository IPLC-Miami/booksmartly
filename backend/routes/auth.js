const express = require('express');
const router = express.Router();
const { sendSMS, startVerification, checkVerification } = require('../services/twilio');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await startVerification(phone);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    const result = await checkVerification(phone, code);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;