const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fixed getUserProfile function that prioritizes clinicians over clients
async function getUserProfile(userId) {
  try {
    // FIRST check if user exists in clinicians2 table (PRIORITY)
    const { data: clinicianData, error: clinicianError } = await supabase
      .from("clinicians2")
      .select("*, 'clinician' as user_type")
      .eq("user_id", userId)
      .maybeSingle();

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
      .from("clients")
      .select("*, 'client' as user_type")
      .eq("user_id", userId)
      .maybeSingle();

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

    return { data: null, error: { message: "User profile not found" } };
  } catch (error) {
    return { data: null, error };
  }
}

async function testRoleFix() {
  console.log('=== TESTING ROLE FIX ===');
  
  const adminUserId = '6daef933-0d33-4b52-a4c0-6dec8bb0ebfd';
  
  console.log(`\nTesting admin user: ${adminUserId}`);
  
  const result = await getUserProfile(adminUserId);
  
  if (result.error) {
    console.log('❌ ERROR:', result.error);
  } else {
    console.log('✅ SUCCESS!');
    console.log('User Role:', result.data.role);
    console.log('User Type:', result.data.user_type);
    console.log('Email:', result.data.email);
    console.log('Name:', result.data.name);
  }
}

testRoleFix().catch(console.error);