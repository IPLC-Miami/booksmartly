import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey ? 'Present ✅' : 'Missing ❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing basic connection...');
    
    // Test basic connection with auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth connection error:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
    }
    
    console.log('\n🔄 Testing database connection...');
    
    // Test database connection by checking if we can query a table
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (dbError) {
      console.error('❌ Database connection error:', dbError.message);
      console.error('Error details:', dbError);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Users table accessible');
    
    // Test if we can check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(0);
      
    if (tableError) {
      console.error('⚠️  Table structure check failed:', tableError.message);
    } else {
      console.log('✅ Table structure accessible');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    console.error('Full error:', err);
    return false;
  }
}

testConnection().then(success => {
  console.log('\n' + '='.repeat(50));
  console.log(success ? '🎉 SUPABASE CONNECTION TEST PASSED' : '💥 SUPABASE CONNECTION TEST FAILED');
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
});