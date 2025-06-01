require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('\nChecking clinicians2 table structure...');
  const { data, error } = await supabase
    .from('clinicians2')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Sample record:', data);
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    }
  }
  
  console.log('\nChecking clients table structure...');
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .limit(1);
  
  if (clientError) {
    console.log('Error:', clientError);
  } else {
    console.log('Sample record:', clientData);
    if (clientData && clientData.length > 0) {
      console.log('Columns:', Object.keys(clientData[0]));
    }
  }
}

checkTableStructure().catch(console.error);