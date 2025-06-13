require('dotenv').config();
const { supabase } = require('./backend/config/supabaseClient');

async function getTableSchema() {
  try {
    console.log('Getting doctor_slots table schema...');
    
    // Query the information_schema to get column details
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'doctor_slots' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.error('Error getting schema:', error);
      
      // Try alternative approach - attempt to insert a test record to see what columns are expected
      console.log('\nTrying alternative approach - attempting insert to see expected columns...');
      const { error: insertError } = await supabase
        .from('doctor_slots')
        .insert({
          test: 'test'
        });
      
      console.log('Insert error (shows expected columns):', insertError);
    } else {
      console.log('Doctor_slots table columns:');
      data.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getTableSchema().then(() => {
  console.log('Schema check finished');
  process.exit(0);
}).catch((error) => {
  console.error('Schema check failed:', error);
  process.exit(1);
});