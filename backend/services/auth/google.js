const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // In a real app, you would find or create a user in your database.
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    return cb(null, profile);
  }));
} else {
  console.info('[Auth] Google disabled – env vars missing');
}

// Export a noop stub if the strategy is disabled
module.exports = {
  authenticate: passport.authenticate('google', { scope: ['profile', 'email'] }),
  callback: (req, res) => {
    res.redirect('/');
  }
};