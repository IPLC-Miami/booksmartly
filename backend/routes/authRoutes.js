const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Create a separate Supabase client for database operations that always uses service role
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to determine user role by checking tables in priority order
async function determineUserRole(userId) {
  console.log('🔍 determineUserRole called with userId:', userId);
  
  try {
    // First check clinicians table (highest priority)
    console.log('📋 Checking clinicians table...');
    const { data: clinicianData, error: clinicianError } = await supabaseAdmin
      .from('clinicians')
      .select('user_id, email, name, specialty, phone, license_number, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('📋 Clinician query result:', { data: clinicianData, error: clinicianError?.message });

    if (clinicianData && !clinicianError) {
      console.log('✅ Found clinician profile');
      return {
        role: 'clinician',
        profile: clinicianData
      };
    }

    // Second check receptions table (Note: receptions table doesn't have user_id column)
    // For now, skip receptions table until proper user_id linking is implemented
    console.log('📋 Skipping receptions table (no user_id column)');
    const receptionData = null;
    const receptionError = null;

    if (receptionData && !receptionError) {
      console.log('✅ Found reception profile');
      return {
        role: 'reception',
        profile: receptionData
      };
    }
    // Third check clients table (lowest priority)
    console.log('📋 Checking clients table...');
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, user_id, email, first_name, last_name, phone, date_of_birth, address')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('📋 Client query result:', { data: clientData, error: clientError?.message });

    if (clientData && !clientError) {
      console.log('✅ Found client profile');
      return {
        role: 'client',
        profile: {
          ...clientData,
          name: `${clientData.first_name} ${clientData.last_name}`
        }
      };
    }

    console.log('❌ No profile found in any role table');
    return { role: null, profile: null };
  } catch (error) {
    console.error('❌ Error determining user role:', error);
    return { role: null, profile: null };
  }
}

// POST /signin - Email/password authentication with role determination
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const user = authData.user;
    const session = authData.session;

    if (!user || !session) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Determine user role and get profile data
    const { role, profile } = await determineUserRole(user.id);

    if (!role) {
      return res.status(404).json({ error: 'User profile not found in any role table' });
    }

    // Set both session cookies (access token and refresh token)
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/'
    };

    // 1) Access token cookie
    res.cookie('sb:token', session.access_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000 // 1 hour, match JWT expiry
    });

    // 2) Refresh token cookie
    res.cookie('sb:refresh-token', session.refresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
    });

    res.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        role,
        profile
      },
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at
      }
    });

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /signup - Client registration only
router.post('/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, date_of_birth, address } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const user = authData.user;

    if (!user) {
      return res.status(400).json({ error: 'User creation failed' });
    }

    // Create client profile
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert([{
        user_id: user.id,
        email: user.email,
        first_name,
        last_name,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        address: address || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (clientError) {
      // If client creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(user.id);
      return res.status(400).json({ error: 'Failed to create client profile' });
    }

    res.status(201).json({
      message: 'Client registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: 'client',
        profile: {
          ...clientData,
          name: `${first_name} ${last_name}`
        }
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /signout - Clear session cookies
router.post('/signout', async (req, res) => {
  try {
    // Clear both session cookies
    res.clearCookie('sb:token');
    res.clearCookie('sb:refresh-token');
    
    res.json({ message: 'Sign out successful' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;