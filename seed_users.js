const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Reception account data
const receptionData = {
  email: 'iplcmiami@gmail.com',
  password: 'Iplc2353!',
  name: 'Reception Admin'
};

// Clinician accounts data - Speech-Language Pathologists, Occupational Therapists, SLPAs, and COTAs
const cliniciansData = [
  { email: 'aquin217@fiu.edu', name: 'Aquin LastName', specialty: 'Speech-Language Pathology' },
  { email: 'Bammservices@yahoo.com', name: 'Maggy Del Valle', specialty: 'Occupational Therapy' },
  { email: 'giannaiesposito@gmail.com', name: 'Gianna Esposito', specialty: 'Speech-Language Pathology' },
  { email: 'iguerra.ots@gmail.com', name: 'Isabel Guerra', specialty: 'Occupational Therapy' },
  { email: 'IsaAreces1@gmail.com', name: 'Isabelle Areces', specialty: 'Speech-Language Pathology' },
  { email: 'Karinadelarosa914@gmail.com', name: 'Karina De La Rosa', specialty: 'Speech-Language Pathology' },
  { email: 'adarley23@gmail.com', name: 'Alissa M Darley', specialty: 'Speech-Language Pathology' },
  { email: 'Nancyc731@icloud.com', name: 'Nancy Beato', specialty: 'Occupational Therapy' }
];

async function createOrUpdateReceptionAccount() {
  try {
    // First, try to get existing user
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return null;
    }

    const existingUser = existingUsers.users.find(user => user.email.toLowerCase() === receptionData.email.toLowerCase());
    
    if (existingUser) {
      
      // Check if reception row exists
      const { data: existingReception, error: receptionCheckError } = await supabase
        .from('receptions')
        .select('*')
        .eq('id', existingUser.id)
        .single();

      if (receptionCheckError && receptionCheckError.code !== 'PGRST116') {
        console.error('Error checking reception row:', receptionCheckError);
        return null;
      }

      if (!existingReception) {
        // Insert reception row for existing user
        const { data: receptionRow, error: receptionError } = await supabase
          .from('receptions')
          .insert({
            id: existingUser.id,
            name: receptionData.name,
            address: '2780 SW 37th Ave #203, Miami, FL 33133',
            phone: '(786) 622-2353'
          })
          .select()
          .single();

        if (receptionError) {
          console.error('Error inserting reception row:', receptionError);
          return null;
        }

      } else {
        // Reception row already exists
      }

      return existingUser.id;
    }

    // Create new auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: receptionData.email,
      password: receptionData.password,
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating reception auth user:', authError);
      return null;
    }


    // Insert into receptions table
    const { data: receptionRow, error: receptionError } = await supabase
      .from('receptions')
      .insert({
        id: authData.user.id,
        name: receptionData.name,
        address: '2780 SW 37th Ave #203, Miami, FL 33133',
        phone: '(786) 622-2353'
      })
      .select()
      .single();

    if (receptionError) {
      console.error('Error inserting reception row:', receptionError);
      return null;
    }

    return authData.user.id;
  } catch (error) {
    console.error('Unexpected error creating reception account:', error);
    return null;
  }
}

async function createOrUpdateClinicianAccount(clinicianData) {
  try {
    // First, try to get existing user
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return null;
    }

    const existingUser = existingUsers.users.find(user => user.email.toLowerCase() === clinicianData.email.toLowerCase());
    
    if (existingUser) {
      
      // Check if clinician row exists
      const { data: existingClinician, error: clinicianCheckError } = await supabase
        .from('clinicians')
        .select('*')
        .eq('user_id', existingUser.id)
        .single();

      if (clinicianCheckError && clinicianCheckError.code !== 'PGRST116') {
        console.error('Error checking clinician row:', clinicianCheckError);
        return null;
      }

      if (!existingClinician) {
        // Insert clinician row for existing user
        const { data: clinicianRow, error: clinicianError } = await supabase
          .from('clinicians')
          .insert({
            user_id: existingUser.id,
            name: clinicianData.name,
            email: clinicianData.email,
            specialty: clinicianData.specialty,
            is_active: true
          })
          .select()
          .single();

        if (clinicianError) {
          console.error(`Error inserting clinician row for ${clinicianData.email}:`, clinicianError);
          return null;
        }

      } else {
        // Clinician row already exists
      }

      return {
        user_id: existingUser.id,
        email: clinicianData.email,
        name: clinicianData.name,
        specialty: clinicianData.specialty
      };
    }

    // Create new auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: clinicianData.email,
      password: 'Iplcmiami1',
      email_confirm: true
    });

    let userId;
    if (authError) {
      if (authError.code === 'email_exists') {
        // Try to find the existing user by email
        const { data: users, error: getUserError } = await supabase.auth.admin.listUsers();
        if (getUserError) {
          console.error(`Error listing users to find ${clinicianData.email}:`, getUserError);
          return null;
        }
        
        const existingUser = users.users.find(u => u.email.toLowerCase() === clinicianData.email.toLowerCase());
        if (!existingUser) {
          console.error(`Could not find existing user for ${clinicianData.email}`);
          return null;
        }
        userId = existingUser.id;
      } else {
        console.error(`Error creating auth user for ${clinicianData.email}:`, authError);
        return null;
      }
    } else {
      userId = authData.user.id;
      
    }

    // Check if clinician row already exists
    const { data: existingClinician, error: clinicianCheckError } = await supabase
      .from('clinicians')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (clinicianCheckError && clinicianCheckError.code !== 'PGRST116') {
      console.error(`Error checking existing clinician row for ${clinicianData.email}:`, clinicianCheckError);
      return null;
    }

    if (existingClinician) {
      // Clinician row already exists
      return {
        user_id: userId,
        email: clinicianData.email,
        name: clinicianData.name,
        specialty: clinicianData.specialty
      };
    }

    // Insert into clinicians table
    const { data: clinicianRow, error: clinicianError } = await supabase
      .from('clinicians')
      .insert({
        user_id: userId,
        name: clinicianData.name,
        email: clinicianData.email,
        specialty: clinicianData.specialty,
        is_active: true
      })
      .select()
      .single();

    if (clinicianError) {
      console.error(`Error inserting clinician row for ${clinicianData.email}:`, clinicianError);
      return null;
    }

    
    return {
      user_id: userId,
      email: clinicianData.email,
      name: clinicianData.name,
      specialty: clinicianData.specialty
    };
  } catch (error) {
    console.error(`Unexpected error creating clinician account for ${clinicianData.email}:`, error);
    return null;
  }
}

async function seedUsers() {
  console.log('🚀 Starting user seeding process...');
  console.log('📧 Target accounts:');
  console.log('   - Reception: iplcmiami@gmail.com');
  console.log('   - Clinicians:', cliniciansData.length, 'accounts');
  console.log('');

  // Create reception account
  console.log('Creating reception account...');
  const receptionId = await createOrUpdateReceptionAccount();
  if (receptionId) {
    console.log('✅ Reception account created/updated successfully');
  } else {
    console.error('❌ Failed to create/update reception account. Continuing with clinicians...');
  }
  console.log('');

  // Create clinician accounts
  console.log('Creating clinician accounts...');
  const createdClinicians = [];
  const failedClinicians = [];
  
  for (const clinicianData of cliniciansData) {
    console.log(`Processing: ${clinicianData.name} (${clinicianData.email})`);
    const result = await createOrUpdateClinicianAccount(clinicianData);
    if (result) {
      createdClinicians.push(result);
      console.log(`✅ ${clinicianData.name} - Account created/updated successfully`);
    } else {
      failedClinicians.push(clinicianData);
      console.log(`❌ ${clinicianData.name} - Failed to create account`);
    }
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('');
  console.log('📊 SEEDING SUMMARY:');
  console.log('==================');
  console.log(`Reception account: ${receptionId ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Clinicians created: ${createdClinicians.length}/${cliniciansData.length}`);
  
  if (createdClinicians.length > 0) {
    console.log('');
    console.log('✅ Successfully created/updated clinician accounts:');
    createdClinicians.forEach(clinician => {
      console.log(`   - ${clinician.name} (${clinician.email}) - ${clinician.specialty}`);
    });
  }
  
  if (failedClinicians.length > 0) {
    console.log('');
    console.log('❌ Failed to create clinician accounts:');
    failedClinicians.forEach(clinician => {
      console.log(`   - ${clinician.name} (${clinician.email})`);
    });
  }
  
  console.log('');
  console.log('🎯 All accounts should now be available for login with password: Iplcmiami1');
  console.log('✨ Seeding process completed!');
}

// Run the seeding process
seedUsers().catch(console.error);