const passport = require('passport');

require('../services/auth/google');
require('../services/auth/facebook');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // In a real app, you would find the user in your database by their ID.
  // User.findById(id, function(err, user) {
  //   done(err, user);
  // });
  done(null, { id });
});

module.exports = passport;