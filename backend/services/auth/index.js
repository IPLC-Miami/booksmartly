const passport = require('passport');
const noop = (_req, _res, next) => next();

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
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
exports.googleCb = process.env.GOOGLE_CLIENT_ID ? passport.authenticate('google') : noop;

module.exports = passport;