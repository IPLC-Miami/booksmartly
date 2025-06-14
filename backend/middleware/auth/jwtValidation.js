const { supabaseAdmin } = require('./supabaseAdmin');

const jwtValidation = async (req, res, next) => {
  try {
    // Extract token from Authorization header or cookies
    let token = null;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Fallback to HttpOnly cookie
    if (!token && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      // Token is invalid or expired
      if (error?.message?.includes('expired')) {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          refreshRequired: true
        });
      }
      
      return res.status(401).json({
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      });
    }

    // Verify user is active and not banned
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      return res.status(403).json({
        error: 'Account is temporarily suspended',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Add user to request context
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('JWT validation error:', error);
    return res.status(500).json({
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

module.exports = { jwtValidation };