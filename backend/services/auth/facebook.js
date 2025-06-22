const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // In a real app, you would find or create a user in your database.
    // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    return cb(null, profile);
  }));
} else {
  console.info('[Auth] Facebook disabled – env vars missing');
}

// Export a noop stub if the strategy is disabled
module.exports = {
  authenticate: passport.authenticate('facebook'),
  callback: (req, res) => {
    res.redirect('/');
  }
};