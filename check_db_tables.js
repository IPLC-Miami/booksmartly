require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('=== CHECKING SUPABASE DATABASE TABLES ===\n');
  
  // Tables that the code might be looking for
  const tablesToCheck = ['profiles', 'clients', 'clinicians', 'clinicians2'];
  
  for (const tableName of tablesToCheck) {
    console.log(`CHECKING TABLE: ${tableName}`);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table '${tableName}' ERROR: ${error.message}`);
      } else {
        console.log(`   ✅ Table '${tableName}' EXISTS and accessible`);
        if (data.length > 0) {
          console.log(`   Sample columns:`, Object.keys(data[0]));
        } else {
          console.log(`   Table is empty`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Table '${tableName}' EXCEPTION: ${err.message}`);
    }
    console.log('');
  }
  
  // Check auth users
  console.log('CHECKING AUTH USERS:');
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('   ❌ Cannot access auth.users:', authError.message);
    } else {
      console.log(`   ✅ Auth users found: ${authUsers.users.length}`);
      
      // Find admin user
      const adminEmail = 'iplcmiami@gmail.com';
      const admin = authUsers.users.find(u => u.email === adminEmail);
      
      if (admin) {
        console.log(`   ✅ Admin user found: ${admin.id}`);
        
        // Check admin in each profile table
        for (const tableName of ['clients', 'clinicians2']) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from(tableName)
              .select('*')
              .eq('user_id', admin.id);
            
            if (profileError) {
              console.log(`   ❌ Error checking ${tableName}:`, profileError.message);
            } else {
              console.log(`   ${tableName}: ${profile.length > 0 ? '✅ PROFILE EXISTS' : '❌ NO PROFILE'}`);
              if (profile.length > 0) {
                console.log(`   ${tableName} data:`, profile[0]);
              }
            }
          } catch (err) {
            console.log(`   ❌ Exception checking ${tableName}:`, err.message);
          }
        }
      } else {
        console.log(`   ❌ Admin user ${adminEmail} NOT FOUND`);
      }
    }
  } catch (err) {
    console.log('   ❌ Auth exception:', err.message);
  }
}

checkTables();