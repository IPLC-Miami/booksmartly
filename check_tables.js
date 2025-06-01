const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('Checking clinicians2 table structure...');
  const { data, error } = await supabase
    .from('clinicians2')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Sample record:', data);
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
  }
}

checkTableStructure().catch(console.error);