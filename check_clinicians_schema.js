const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://itbxttkivivyeqnduxjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Ynh0dGtpdml2eWVxbmR1eGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU0NTQ0MywiZXhwIjoyMDY0MTIxNDQzfQ.yCiiwoiBKL00NSRNghpDs_EGlc6XrTXdGnvzBPqpaUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCliniciansSchema() {
  try {
    // Get a sample record to see the structure
    const { data, error } = await supabase
      .from('clinicians2')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Clinicians2 table structure:');
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
      console.log('Sample record:', data[0]);
    } else {
      console.log('No records found in clinicians2 table');
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  }
}

checkCliniciansSchema();