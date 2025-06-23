const express = require('express');
const router = express.Router();

router.get('/diagnostic', (req, res) => {
  res.json({
    status: 'ok',
    square_configured: !!(process.env.SQUARE_SANDBOX_ACCESS_TOKEN),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;