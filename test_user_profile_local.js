require('dotenv').config({path: './backend/.env'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Copy the exact getUserProfile function from userRoutes.js
async function getUserProfile(userId) {
  try {
    // FIRST check if user exists in clinicians2 table (PRIORITY)
    const { data: clinicianData, error: clinicianError } = await supabase
      .from('clinicians2')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Clinicians2 query result:');
    console.log('Data:', clinicianData);
    console.log('Error:', clinicianError);

    if (clinicianData && !clinicianError) {
      // Get email from auth.users since clinicians2 doesn't have email field
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      const email = authUser?.user?.email || '';

      return {
        data: {
          id: clinicianData.user_id,
          email: email,
          name: clinicianData.name || '',
          phone: clinicianData.phone || '',
          phone_number: clinicianData.phone || '',
          specialty: clinicianData.specialty,
          user_type: 'clinician',
          role: 'clinician',
          ...clinicianData
        },
        error: null
      };
    }

    // SECOND check if user exists in clients table (FALLBACK)
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Clients query result:');
    console.log('Data:', clientData);
    console.log('Error:', clientError);

    if (clientData && !clientError) {
      return {
        data: {
          id: clientData.user_id,
          email: clientData.email,
          name: `${clientData.first_name} ${clientData.last_name}`,
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          phone: clientData.phone,
          phone_number: clientData.phone,
          date_of_birth: clientData.date_of_birth,
          address: clientData.address,
          user_type: 'client',
          role: 'client',
          ...clientData
        },
        error: null
      };
    }

    return { data: null, error: { message: 'User profile not found' } };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error: { message: error.message } };
  }
}

async function testUserProfile() {
  const userId = '6daef933-0d33-4b52-a4c0-6dec8bb0ebfd';
  
  console.log('=== TESTING getUserProfile FUNCTION ===');
  console.log('Testing admin user:', userId);
  
  const result = await getUserProfile(userId);
  
  console.log('\n=== FINAL RESULT ===');
  console.log('Result:', JSON.stringify(result, null, 2));
  
  if (result.data) {
    console.log('\n✅ SUCCESS: User profile found');
    console.log('Role:', result.data.role);
    console.log('User Type:', result.data.user_type);
  } else {
    console.log('\n❌ FAILED: User profile not found');
    console.log('Error:', result.error);
  }
}

testUserProfile().catch(console.error);