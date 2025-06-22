const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback, facebookAuth, facebookCallback } = require('../services/auth');

// Google authentication routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Facebook authentication routes
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookCallback);

module.exports = router;