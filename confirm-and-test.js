const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_KEY;

console.log('=== Confirming Email and Testing Authentication ===\n');

// Create admin client with service role key for email confirmation
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// Create regular client for testing
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function confirmEmailAndTest() {
  try {
    console.log('1. Confirming email for test user...');
    
    // First, let's get the user by email using admin client
    const { data: users, error: getUserError } = await adminClient.auth.admin.listUsers();
    
    if (getUserError) {
      console.log('❌ Error getting users:', getUserError.message);
      return;
    }
    
    const testUser = users.users.find(user => user.email === 'test@booksmartly.com');
    
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log('✅ Test user found:', testUser.id);
    console.log('   Email confirmed:', testUser.email_confirmed_at ? 'Yes' : 'No');
    
    // Confirm the email if not already confirmed
    if (!testUser.email_confirmed_at) {
      console.log('2. Confirming email...');
      
      const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
        testUser.id,
        { email_confirm: true }
      );
      
      if (updateError) {
        console.log('❌ Error confirming email:', updateError.message);
        return;
      }
      
      console.log('✅ Email confirmed successfully');
    } else {
      console.log('✅ Email already confirmed');
    }
    
    // Now test login with regular client
    console.log('\n3. Testing login with confirmed user...');
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
    
    // Check if user has profile in database
    console.log('\n4. Checking user profile in database...');
    const userId = loginData.user?.id;
    
    if (userId) {
      // Check clients table
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
        console.log('ℹ️  User not found in clients table - creating profile...');
        
        // Create client profile
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            full_name: 'Test User',
            email: 'test@booksmartly.com',
            role: 'admin'
          })
          .select()
          .single();
        
        if (createError) {
          console.log('❌ Error creating client profile:', createError.message);
        } else {
          console.log('✅ Client profile created successfully');
          console.log('   Name:', newClient.full_name);
          console.log('   Role:', newClient.role);
        }
      }
    }
    
    // Test logout
    console.log('\n5. Testing logout...');
    const { error: logoutError } = await supabase.auth.signOut();
    
    if (logoutError) {
      console.log('❌ Logout failed:', logoutError.message);
    } else {
      console.log('✅ Logout successful');
    }
    
    console.log('\n=== Authentication Test Complete ===');
    console.log('\n🎉 Ready to test in browser with credentials:');
    console.log('   Email: test@booksmartly.com');
    console.log('   Password: TestPassword123!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

confirmEmailAndTest();
