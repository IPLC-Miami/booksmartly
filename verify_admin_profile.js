const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdminProfile() {
    try {
        const adminUserId = '6daef933-0d33-4b52-a4c0-6dec8bb0ebfd';
        
        console.log('Checking admin user in auth.users...');
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(adminUserId);
        if (authError) {
            console.error('Auth user error:', authError);
        } else {
            console.log('Auth user found:', authUser.user?.email);
        }
        
        console.log('\nChecking admin profile in clients table...');
        const { data: clientProfile, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', adminUserId);
        
        if (clientError) {
            console.error('Client profile error:', clientError);
        } else {
            console.log('Client profile:', clientProfile);
        }
        
        console.log('\nChecking admin profile in clinicians2 table...');
        const { data: clinicianProfile, error: clinicianError } = await supabase
            .from('clinicians2')
            .select('*')
            .eq('user_id', adminUserId);
        
        if (clinicianError) {
            console.error('Clinician profile error:', clinicianError);
        } else {
            console.log('Clinician profile:', clinicianProfile);
        }
        
        // Test the getUserProfile logic manually
        console.log('\nTesting getUserProfile logic...');
        let userProfile = null;
        let userType = null;
        
        if (clientProfile && clientProfile.length > 0) {
            userProfile = clientProfile[0];
            userType = 'client';
            console.log('Found in clients table');
        } else if (clinicianProfile && clinicianProfile.length > 0) {
            userProfile = clinicianProfile[0];
            userType = 'clinician';
            console.log('Found in clinicians2 table');
        }
        
        if (userProfile) {
            const result = {
                ...userProfile,
                user_type: userType,
                role: userType
            };
            console.log('Final profile result:', result);
        } else {
            console.log('❌ No profile found - this explains the error!');
        }
        
    } catch (error) {
        console.error('Verification error:', error);
    }
}

verifyAdminProfile();