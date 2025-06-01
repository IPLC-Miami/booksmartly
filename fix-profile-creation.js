const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createClientProfile() {
  try {
    console.log('🔍 Creating client profile for test user...');
    
    // Get the test user ID
    const testUserEmail = 'test@booksmartly.com';
    
    // First, get the user ID from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      return;
    }
    
    const testUser = authUser.users.find(user => user.email === testUserEmail);
    if (!testUser) {
      console.error('❌ Test user not found');
      return;
    }
    
    console.log('✅ Found test user:', testUser.id);
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', testUser.id)
      .single();
    
    if (existingProfile) {
      console.log('✅ Client profile already exists:', existingProfile);
      return existingProfile;
    }
    
    // Create client profile with correct column names
    const { data: newProfile, error: profileError } = await supabase
      .from('clients')
      .insert({
        user_id: testUser.id,
        first_name: 'Test',
        last_name: 'User',
        email: testUserEmail,
        phone: '+1-555-0123',
        address: '123 Test Street, Test City, TC 12345'
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Error creating client profile:', profileError);
      return;
    }
    
    console.log('✅ Client profile created successfully:', newProfile);
    return newProfile;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function main() {
  console.log('🚀 Starting profile creation fix...');
  await createClientProfile();
  console.log('✅ Profile creation fix completed');
}

main();
