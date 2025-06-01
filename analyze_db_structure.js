require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeDatabase() {
  console.log('=== ANALYZING SUPABASE DATABASE STRUCTURE ===\n');
  
  try {
    // Get all tables in public schema
    console.log('1. GETTING ALL TABLES:');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error getting tables:', tablesError);
      return;
    }
    
    console.log('Tables found:', tables.map(t => t.table_name).sort());
    console.log('\n');
    
    // Check specific tables that the code might be looking for
    const tablesToCheck = ['profiles', 'clients', 'clinicians', 'clinicians2', 'users'];
    
    for (const tableName of tablesToCheck) {
      console.log(`2. CHECKING TABLE: ${tableName}`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table '${tableName}' does NOT exist or is not accessible`);
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.log(`   ✅ Table '${tableName}' exists and is accessible`);
        if (data.length > 0) {
          console.log(`   Sample columns:`, Object.keys(data[0]));
        }
        console.log('');
      }
    }
    
    // Check auth.users table
    console.log('3. CHECKING AUTH.USERS TABLE:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('   ❌ Cannot access auth.users:', authError.message);
    } else {
      console.log(`   ✅ Auth users found: ${authUsers.users.length}`);
      if (authUsers.users.length > 0) {
        console.log('   Sample user:', {
          id: authUsers.users[0].id,
          email: authUsers.users[0].email,
          created_at: authUsers.users[0].created_at
        });
      }
    }
    console.log('');
    
    // Check for admin user specifically
    console.log('4. CHECKING FOR ADMIN USER:');
    const adminEmail = 'iplcmiami@gmail.com';
    const { data: adminUser, error: adminError } = await supabase.auth.admin.listUsers();
    
    if (adminError) {
      console.log('   ❌ Cannot check admin user:', adminError.message);
    } else {
      const admin = adminUser.users.find(u => u.email === adminEmail);
      if (admin) {
        console.log(`   ✅ Admin user found:`, {
          id: admin.id,
          email: admin.email,
          email_confirmed_at: admin.email_confirmed_at
        });
        
        // Check if admin has profile in clients table
        const { data: clientProfile, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', admin.id);
        
        if (clientError) {
          console.log('   ❌ Error checking clients table:', clientError.message);
        } else {
          console.log(`   Clients profile: ${clientProfile.length > 0 ? '✅ EXISTS' : '❌ NOT FOUND'}`);
          if (clientProfile.length > 0) {
            console.log('   Client data:', clientProfile[0]);
          }
        }
        
        // Check if admin has profile in clinicians2 table
        const { data: clinicianProfile, error: clinicianError } = await supabase
          .from('clinicians2')
          .select('*')
          .eq('user_id', admin.id);
        
        if (clinicianError) {
          console.log('   ❌ Error checking clinicians2 table:', clinicianError.message);
        } else {
          console.log(`   Clinicians2 profile: ${clinicianProfile.length > 0 ? '✅ EXISTS' : '❌ NOT FOUND'}`);
          if (clinicianProfile.length > 0) {
            console.log('   Clinician data:', clinicianProfile[0]);
          }
        }
      } else {
        console.log(`   ❌ Admin user with email ${adminEmail} NOT FOUND`);
      }
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

analyzeDatabase();