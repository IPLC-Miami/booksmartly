const passport = require('passport');
const noop = (_req, _res, next) => next();

// Guarded initialization for Facebook
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.FACEBOOK_APP_ID !== '__DISABLED__') {
  const { Strategy: FacebookStrategy } = require('passport-facebook');
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback"
  }, (accessToken, refreshToken, profile, cb) => {
    // In a real app, find or create a user in your database
    return cb(null, profile);
  }));
} else {
  console.info('[Auth] Facebook disabled – env vars missing');
}

// Guarded initialization for Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== '__DISABLED__') {
  const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, (accessToken, refreshToken, profile, cb) => {
    // In a real app, find or create a user in your database
    return cb(null, profile);
  }));
} else {
  console.info('[Auth] Google disabled – env vars missing');
}

// Export auth-related middleware
exports.facebookAuth = passport.authenticate('facebook');
exports.facebookCallback = (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_ID !== '__DISABLED__')
  ? passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' })
  : noop;

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
exports.googleCallback = (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== '__DISABLED__')
  ? passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' })
  : noop;

module.exports = passport;