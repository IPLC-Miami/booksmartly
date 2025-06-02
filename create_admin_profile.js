const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminProfile() {
  const userId = '6daef933-0d33-4b52-a4c0-6dec8bb0ebfd';
  const email = 'iplcmiami@gmail.com';
  
  try {
    const { data, error } = await supabase
      .from('clinicians2')
      .insert({
        user_id: userId,
        email: email,
        first_name: 'IPLC',
        last_name: 'Admin',
        phone: '555-0000',
        specialization: 'Administration',
        user_type: 'admin',
        role: 'admin'
      });
    
    if (error) {
      console.error('Error creating admin profile:', error);
      
      // If it fails due to RLS, try updating existing record
      const { data: updateData, error: updateError } = await supabase
        .from('clinicians2')
        .update({
          email: email,
          first_name: 'IPLC',
          last_name: 'Admin',
          phone: '555-0000',
          specialization: 'Administration',
          user_type: 'admin',
          role: 'admin'
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Update also failed:', updateError);
      }
    }
    
    // Verify the profile exists
    const { data: verifyData, error: verifyError } = await supabase
      .from('clinicians2')
      .select('*')
      .eq('user_id', userId);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdminProfile().catch(console.error);