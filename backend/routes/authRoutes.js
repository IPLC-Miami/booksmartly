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
    // First check clinicians2 table (highest priority)
    console.log('📋 Checking clinicians2 table...');
    const { data: clinicianData, error: clinicianError } = await supabaseAdmin
      .from('clinicians2')
      .select('user_id, specialty, experience_years, hospital_name, available_from, available_to, license_number, is_active, bio, office_address, consultation_fees')
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

// POST /signin - AUTHENTICATION DISABLED: Always return mock success
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // AUTHENTICATION DISABLED: Return mock authentication data
    res.json({
      message: 'Sign in successful (authentication disabled)',
      user: {
        id: 'mock-user-id',
        email: email,
        role: 'admin',
        profile: {
          id: 'mock-profile-id',
          name: 'Mock User',
          email: email
        }
      },
      session: {
        access_token: 'mock-access-token',
        expires_at: Date.now() + (60 * 60 * 1000) // 1 hour from now
      }
    });

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /signup - AUTHENTICATION DISABLED: Always return mock success
router.post('/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, date_of_birth, address } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    // AUTHENTICATION DISABLED: Return mock registration success
    res.status(201).json({
      message: 'Client registration successful (authentication disabled)',
      user: {
        id: 'mock-user-id',
        email: email,
        role: 'client',
        profile: {
          id: 'mock-profile-id',
          name: `${first_name} ${last_name}`,
          email: email,
          first_name,
          last_name,
          phone: phone || null,
          date_of_birth: date_of_birth || null,
          address: address || null
        }
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /signout - AUTHENTICATION DISABLED: Always return success
router.post('/signout', async (req, res) => {
  try {
    // AUTHENTICATION DISABLED: No cookies to clear, just return success
    res.json({ message: 'Sign out successful (authentication disabled)' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;