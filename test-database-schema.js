import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing database schema...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchema() {
  try {
    console.log('\n=== Testing Supabase Connection ===');
    
    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('Auth error:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
    }

    console.log('\n=== Testing Database Tables ===');
    
    // Test each table that should exist based on migrations
    const tablesToTest = [
      'profiles',
      'clients', 
      'clinicians',
      'appointments',
      'appointment_types'
    ];

    for (const table of tablesToTest) {
      try {
        console.log(`\nTesting table: ${table}`);
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: exists and accessible`);
          if (data && data.length > 0) {
            console.log(`   Sample columns:`, Object.keys(data[0]));
          } else {
            console.log(`   Table is empty`);
          }
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    console.log('\n=== Testing Auth Users Table ===');
    try {
      // This should fail with anon key, but let's see the error
      const { data, error } = await supabase
        .from('auth.users')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ auth.users table:', error.message);
      } else {
        console.log('✅ auth.users table: accessible');
      }
    } catch (err) {
      console.log('❌ auth.users table:', err.message);
    }

  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testDatabaseSchema();