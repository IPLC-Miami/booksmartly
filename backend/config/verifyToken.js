const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    
    // First try to get token from Authorization header (Bearer token)
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    // If no header token, try to get from cookies
    if (!token && req.cookies) {
      token = req.cookies['sb:token'];
    }
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // If token is expired and we have cookies, try to use getUserByCookie for auto-refresh
      if (req.cookies && req.cookies['sb:token'] && req.cookies['sb:refresh-token']) {
        try {
          const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.api.getUserByCookie(req);
          
          if (cookieUser && !cookieError) {
            req.user = cookieUser;
            return next();
          }
        } catch (cookieErr) {
          console.log('Cookie auth failed:', cookieErr.message);
        }
      }
      
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }

    req.user = user; // Attach user info to request
    next(); // Proceed to next middleware or route
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: "Server error verifying token" });
  }
};
module.exports = verifyToken;

