const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key:', supabaseKey ? 'Present' : 'Missing');
console.log('Service Role Key:', serviceRoleKey ? 'Present' : 'Missing');

// Create Supabase client with anon key
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    console.log('\n=== Testing Authentication ===');
    
    // Try to sign in with existing user
    console.log('\n1. Testing login with existing user...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'iplcmiami@gmail.com',
      password: 'IplcMiami2353'
    });
    
    if (loginError) {
      console.log('Login failed:', loginError.message);
    } else {
      console.log('Login successful!', loginData.user?.email);
    }
    
    // Try to create a new test user
    console.log('\n2. Testing user creation...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'test@booksmartly.com',
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User',
          role: 'admin'
        }
      }
    });
    
    if (signupError) {
      console.log('Signup failed:', signupError.message);
    } else {
      console.log('Signup successful!', signupData.user?.email);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();