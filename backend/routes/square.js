const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSquareEnv } = require('../controllers/squareController');

router.get('/env', protect, getSquareEnv);

module.exports = router;