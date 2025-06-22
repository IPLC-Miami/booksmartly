const express = require('express');
const router = express.Router();
const passport = require('passport');
const { googleCb, facebookCb } = require('../services/auth');

// Google authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', googleCb);

// Facebook authentication routes
router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback', facebookCb);

module.exports = router;