const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('../services/auth');
const { sendSMS, startVerification, checkVerification } = require('../services/twilio');

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'client' // Default role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Local email/password login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error', details: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', message: info?.message });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'client'
      }
    });
  })(req, res, next);
});

// Sign up endpoint (placeholder for now)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // TODO: Implement actual user creation in database
    // For now, return a mock response
    res.status(501).json({
      error: 'Signup not implemented yet',
      message: 'Please contact admin to create an account'
    });
  } catch (error) {
    res.status(500).json({ error: 'Signup error', details: error.message });
  }
});

// Password reset endpoint (placeholder)
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // TODO: Implement password reset functionality
    res.status(501).json({
      error: 'Password reset not implemented yet',
      message: 'Please contact admin for password reset'
    });
  } catch (error) {
    res.status(500).json({ error: 'Password reset error', details: error.message });
  }
});

// Update password endpoint (placeholder)
router.post('/update-password', async (req, res) => {
  try {
    // TODO: Implement password update functionality
    res.status(501).json({
      error: 'Password update not implemented yet',
      message: 'Please contact admin for password changes'
    });
  } catch (error) {
    res.status(500).json({ error: 'Password update error', details: error.message });
  }
});

// Token refresh endpoint
router.post('/refresh-token', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify current token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      
      // Generate new token
      const newToken = generateToken({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      });
      
      res.json({ token: newToken });
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh error', details: error.message });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate JWT token for Google user
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

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