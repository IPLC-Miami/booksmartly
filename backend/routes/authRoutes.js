const express = require('express');
const { supabaseAdmin } = require('../middleware/auth/supabaseAdmin');
const { handleTokenRefresh } = require('../middleware/auth/tokenRefresh');
const { jwtValidation, roleExtraction } = require('../middleware/auth/index');

const router = express.Router();

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Email, password, and role are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate role
    const allowedRoles = ['client', 'clinician'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Only client and clinician registration allowed.',
        code: 'INVALID_ROLE'
      });
    }

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        role,
        first_name: firstName,
        last_name: lastName,
        phone
      },
      email_confirm: false // Require email verification
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: 'SIGNUP_ERROR'
      });
    }

    // Create role-specific profile record
    try {
      if (role === 'client') {
        await supabaseAdmin.from('clients').insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone
        });
      } else if (role === 'clinician') {
        await supabaseAdmin.from('clinicians').insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          is_active: false // Require admin approval
        });
      }
    } catch (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return res.status(500).json({
        error: 'Failed to create user profile',
        code: 'PROFILE_CREATION_ERROR'
      });
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: data.user.id,
        email: data.user.email,
        role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Signup service error',
      code: 'SIGNUP_SERVICE_ERROR'
    });
  }
});

// Sign in endpoint
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: error.message,
        code: 'SIGNIN_ERROR'
      });
    }

    const { session, user } = data;

    // Set tokens in HttpOnly cookies
    res.cookie('access_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.cookie('refresh_token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Get user role and profile
    const role = user.user_metadata?.role || 'client';
    let userProfile = null;

    try {
      switch (role) {
        case 'client':
          const { data: clientData } = await supabaseAdmin
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .single();
          userProfile = clientData;
          break;
        case 'clinician':
          const { data: clinicianData } = await supabaseAdmin
            .from('clinicians')
            .select('*')
            .eq('user_id', user.id)
            .single();
          userProfile = clinicianData;
          break;
        case 'admin':
          const { data: adminData } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('user_id', user.id)
            .single();
          userProfile = adminData;
          break;
      }
    } catch (profileError) {
      console.error('Profile loading error:', profileError);
    }

    res.json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        role,
        profile: userProfile
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      error: 'Signin service error',
      code: 'SIGNIN_SERVICE_ERROR'
    });
  }
});

// Sign out endpoint
router.post('/signout', jwtValidation, async (req, res) => {
  try {
    // Revoke session with Supabase
    await supabaseAdmin.auth.admin.signOut(req.token);

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      error: 'Signout service error',
      code: 'SIGNOUT_SERVICE_ERROR'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', handleTokenRefresh);

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: 'RESET_ERROR'
      });
    }

    res.json({
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Password reset service error',
      code: 'RESET_SERVICE_ERROR'
    });
  }
});

// Update password
router.post('/update-password', jwtValidation, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'New password is required',
        code: 'MISSING_PASSWORD'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password }
    );

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: 'UPDATE_PASSWORD_ERROR'
      });
    }

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      error: 'Update password service error',
      code: 'UPDATE_PASSWORD_SERVICE_ERROR'
    });
  }
});

// Get current user profile
router.get('/me', jwtValidation, roleExtraction, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.userRole,
        profile: req.userProfile
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Profile service error',
      code: 'PROFILE_SERVICE_ERROR'
    });
  }
});

module.exports = router;