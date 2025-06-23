const passport = require('passport');
const bcrypt = require('bcrypt');
const noop = (_req, _res, next) => next();

// Guarded initialization for Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== '__DISABLED__') {
  const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, cb) => {
    try {
      // In a real app, find or create a user in your database
      // For now, return the profile with a standardized format
      const user = {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        provider: 'google',
        googleId: profile.id
      };
      return cb(null, user);
    } catch (error) {
      return cb(error, null);
    }
  }));
} else {
  console.info('[Auth] Google OAuth disabled – env vars missing');
}

// Local Strategy for email/password authentication
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // TODO: Replace with actual database lookup
    // This is a placeholder - in production, you would:
    // 1. Query your database for a user with this email
    // 2. Compare the provided password with the stored hash
    // 3. Return the user object if authentication succeeds
    
    console.info(`[Auth] Local login attempt for: ${email}`);
    
    // Mock user for development - replace with real database query
    const mockUser = {
      id: 1,
      email: 'admin@booksmartly.com',
      name: 'Admin User',
      provider: 'local',
      // This is bcrypt hash for 'admin123'
      passwordHash: '$2b$10$iNyvbyuJAPevEEJjDKXFlutYG4GDlOs/wTELWED4UQKiI5QrW7shy'
    };
    
    if (email === mockUser.email) {
      const isValid = await bcrypt.compare(password, mockUser.passwordHash);
      if (isValid) {
        const { passwordHash, ...userWithoutPassword } = mockUser;
        return done(null, userWithoutPassword);
      }
    }
    
    return done(null, false, { message: 'Invalid email or password' });
  } catch (error) {
    return done(error);
  }
}));

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // TODO: Replace with actual database lookup
    // Mock user lookup - replace with real database query
    const mockUser = {
      id: 1,
      email: 'admin@booksmartly.com',
      name: 'Admin User',
      provider: 'local'
    };
    
    if (id == mockUser.id) {
      return done(null, mockUser);
    }
    
    return done(null, false);
  } catch (error) {
    return done(error);
  }
});

// Helper function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Helper function to verify passwords
const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Export auth-related middleware and helpers
exports.googleAuth = process.env.GOOGLE_CLIENT_ID ? passport.authenticate('google', { scope: ['profile', 'email'] }) : noop;
exports.googleCb = process.env.GOOGLE_CLIENT_ID ? passport.authenticate('google') : noop;
exports.localAuth = passport.authenticate('local');
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;

module.exports = passport;