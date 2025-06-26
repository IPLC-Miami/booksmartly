const passport = require('passport');
const bcrypt = require('bcrypt');
const noop = (_req, _res, next) => next();
const mongoose = require('mongoose');
const Client = require('../../models/client');

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
    console.info(`[Auth] Local login attempt for: ${email}`);
    
    // Query the Client model for the user
    const client = await Client.findOne({ email: email.toLowerCase() });
    
    if (!client) {
      console.info(`[Auth] No client found with email: ${email}`);
      return done(null, false, { message: 'No registered client found with this email.' });
    }
    
    // Check if password exists (some clients might have OAuth only)
    if (!client.password) {
      console.info(`[Auth] Client has no password set: ${email}`);
      return done(null, false, { message: 'Please use social login or reset your password.' });
    }
    
    // Compare password with stored hash
    const isValid = await bcrypt.compare(password, client.password);
    
    if (!isValid) {
      console.info(`[Auth] Invalid password for: ${email}`);
      return done(null, false, { message: 'Invalid password' });
    }
    
    // Return user object without password
    const user = {
      id: client._id.toString(),
      email: client.email,
      name: `${client.firstName} ${client.lastName}`,
      firstName: client.firstName,
      lastName: client.lastName,
      role: client.admin ? 'admin' : 'client',
      provider: 'local'
    };
    
    console.info(`[Auth] Successful login for: ${email}`);
    return done(null, user);
  } catch (error) {
    console.error('[Auth] Error during authentication:', error);
    return done(error);
  }
}));

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Query the Client model
    const client = await Client.findById(id);
    
    if (!client) {
      return done(null, false);
    }
    
    // Return user object without password
    const user = {
      id: client._id.toString(),
      email: client.email,
      name: `${client.firstName} ${client.lastName}`,
      firstName: client.firstName,
      lastName: client.lastName,
      role: client.admin ? 'admin' : 'client',
      provider: 'local'
    };
    
    return done(null, user);
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