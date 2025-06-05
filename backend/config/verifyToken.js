const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabaseClient");

const verifyToken = async (req, res, next) => {
  // AUTHENTICATION DISABLED: Always allow access without token verification
  // Set a mock user object for compatibility with existing code
  req.user = {
    id: 'mock-user-id',
    email: 'mock@example.com',
    role: 'admin'
  };
  next(); // Always proceed to next middleware or route
};
module.exports = verifyToken;

