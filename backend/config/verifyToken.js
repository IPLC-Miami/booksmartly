const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabaseClient");

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
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // If token is expired and we have cookies, try to refresh using refresh token
      if (req.cookies && req.cookies['sb:refresh-token']) {
        try {
          const refreshToken = req.cookies['sb:refresh-token'];
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
          });
          
          if (refreshData?.session && refreshData?.user && !refreshError) {
            // Update cookies with new tokens
            const isProd = process.env.NODE_ENV === 'production';
            const cookieOptions = {
              httpOnly: true,
              secure: isProd,
              sameSite: 'lax',
              path: '/'
            };

            // Set new access token cookie
            res.cookie('sb:token', refreshData.session.access_token, {
              ...cookieOptions,
              maxAge: 60 * 60 * 1000 // 1 hour
            });

            // Set new refresh token cookie if provided
            if (refreshData.session.refresh_token) {
              res.cookie('sb:refresh-token', refreshData.session.refresh_token, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
              });
            }

            console.log('✅ Token refreshed successfully for user:', refreshData.user.id);
            req.user = refreshData.user;
            return next();
          }
        } catch (cookieErr) {
          console.log('❌ Token refresh failed:', cookieErr.message);
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

