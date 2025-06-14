const { supabaseAdmin } = require('./supabaseAdmin');

const roleExtraction = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Extract role from user metadata (consistent with frontend)
    let role = req.user.user_metadata?.role ||
               req.user.app_metadata?.role;

    // TEMPORARY FIX: Explicitly check for admin email (consistent with frontend)
    if (!role && req.user.email === 'iplcmiami@gmail.com') {
      console.log('🔧 BACKEND TEMPORARY FIX: Assigning admin role to iplcmiami@gmail.com');
      role = 'admin';
    }

    // Default to client if no role found
    if (!role) {
      role = 'client';
    }

    // Validate role is one of the allowed values
    const allowedRoles = ['client', 'clinician', 'admin'];
    if (!allowedRoles.includes(role)) {
      console.error(`Invalid user role: ${role} for user ${req.user.id}`);
      return res.status(403).json({
        error: 'Invalid user role',
        code: 'INVALID_ROLE'
      });
    }

    // Add role to request context
    req.userRole = role;
    
    // Load role-specific profile data
    let userProfile = null;
    try {
      switch (role) {
        case 'client':
          const { data: clientData } = await supabaseAdmin
            .from('clients')
            .select('*')
            .eq('user_id', req.user.id)
            .single();
          userProfile = clientData;
          break;
        case 'clinician':
          const { data: clinicianData } = await supabaseAdmin
            .from('clinicians')
            .select('*')
            .eq('user_id', req.user.id)
            .single();
          userProfile = clinicianData;
          break;
        case 'admin':
          const { data: adminData } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('user_id', req.user.id)
            .single();
          userProfile = adminData;
          break;
      }
    } catch (profileError) {
      console.error('Error loading user profile:', profileError);
      // Continue without profile data - some endpoints may not need it
    }

    req.userProfile = userProfile;
    next();
  } catch (error) {
    console.error('Role extraction error:', error);
    return res.status(500).json({
      error: 'Role extraction service error',
      code: 'ROLE_SERVICE_ERROR'
    });
  }
};

module.exports = { roleExtraction };