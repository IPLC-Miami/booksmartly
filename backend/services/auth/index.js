const passport = require('passport');
const noop = (_req, _res, next) => next();

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.FACEBOOK_APP_ID !== '__DISABLED__') {
  const { Strategy: FacebookStrategy } = require('passport-facebook');
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback"
  }, (accessToken, refreshToken, profile, cb) => {
    return cb(null, profile);
  }));
  exports.facebookCb = passport.authenticate('facebook');
} else {
  console.info('[Auth] Facebook disabled');
  exports.facebookCb = noop;
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== '__DISABLED__') {
  const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, (accessToken, refreshToken, profile, cb) => {
    return cb(null, profile);
  }));
  exports.googleCb = passport.authenticate('google');
} else {
  console.info('[Auth] Google disabled');
  exports.googleCb = noop;
}

module.exports = passport;