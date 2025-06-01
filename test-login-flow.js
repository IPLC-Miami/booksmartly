const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('=== Testing Complete Authentication Flow ===\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteFlow() {
  try {
    // Test 1: Login with our test user
    console.log('1. Testing login with test user...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@booksmartly.com',
      password: 'TestPassword123!'
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('   User ID:', loginData.user?.id);
    console.log('   Email:', loginData.user?.email);
    console.log('   Role:', loginData.user?.user_metadata?.role || 'No role set');
    console.log('   Session:', loginData.session ? 'Active' : 'None');
    
    // Test 2: Check current session
    console.log('\n2. Checking current session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session check failed:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Active session found');
      console.log('   Access Token:', sessionData.session.access_token ? 'Present' : 'Missing');
      console.log('   Expires at:', new Date(sessionData.session.expires_at * 1000).toLocaleString());
    } else {
      console.log('❌ No active session');
    }
    
    // Test 3: Check user profile in database
    console.log('\n3. Checking user profile in database...');
    const userId = loginData.user?.id;
    
    if (userId) {
      // Check if user exists in clients table
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (clientError && clientError.code !== 'PGRST116') {
        console.log('❌ Error checking clients table:', clientError.message);
      } else if (clientData) {
        console.log('✅ User found in clients table');
        console.log('   Name:', clientData.full_name);
        console.log('   Role:', clientData.role);
      } else {
        console.log('ℹ️  User not found in clients table');
      }
      
      // Check if user exists in clinicians2 table
      const { data: clinicianData, error: clinicianError } = await supabase
        .from('clinicians2')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (clinicianError && clinicianError.code !== 'PGRST116') {
        console.log('❌ Error checking clinicians2 table:', clinicianError.message);
      } else if (clinicianData) {
        console.log('✅ User found in clinicians2 table');
        console.log('   Name:', clinicianData.full_name);
        console.log('   Specialty:', clinicianData.specialty);
      } else {
        console.log('ℹ️  User not found in clinicians2 table');
      }
    }
    
    // Test 4: Test logout
    console.log('\n4. Testing logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.log('❌ Logout failed:', logoutError.message);
    } else {
      console.log('✅ Logout successful');
    }
    
    // Test 5: Verify session is cleared
    console.log('\n5. Verifying session is cleared...');
    const { data: postLogoutSession } = await supabase.auth.getSession();
    
    if (postLogoutSession.session) {
      console.log('❌ Session still active after logout');
    } else {
      console.log('✅ Session cleared successfully');
    }
    
    console.log('\n=== Authentication Flow Test Complete ===');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testCompleteFlow();
