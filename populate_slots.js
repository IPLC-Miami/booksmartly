require('dotenv').config();
const { supabase } = require('./backend/config/supabaseClient');

async function populateSlots() {
  try {
    console.log('Starting slot population...');
    
    // First, get the existing clinicians from clinicians2 table
    const { data: clinicians, error: cliniciansError } = await supabase
      .from('clinicians2')
      .select('id, user_id, specialty, hospital_name');
    
    if (cliniciansError) {
      console.error('Error fetching clinicians:', cliniciansError);
      return;
    }
    
    console.log('Found clinicians:', clinicians);
    
    // Clear existing slots first (since table is empty, we can skip this)
    // const { error: deleteError } = await supabase
    //   .from('doctor_slots')
    //   .delete()
    //   .gt('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    // if (deleteError) {
    //   console.error('Error clearing existing slots:', deleteError);
    //   return;
    // }
    
    console.log('Skipping delete since table is empty');
    
    // Generate slots for each clinician
    const slotsToInsert = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dates = [today, tomorrow];
    
    for (const clinician of clinicians) {
      for (const date of dates) {
        // Generate slots from 9:00 AM to 5:00 PM (30-minute intervals)
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotTime = new Date(date);
            slotTime.setHours(hour, minute, 0, 0);
            
            const startTime = slotTime.toTimeString().split(' ')[0]; // HH:MM:SS format
            const endTime = new Date(slotTime.getTime() + 30 * 60000).toTimeString().split(' ')[0]; // Add 30 minutes
            
            slotsToInsert.push({
              clinician_id: clinician.user_id,
              slot_date: date.toISOString().split('T')[0], // YYYY-MM-DD format
              start_time: startTime,
              end_time: endTime,
              is_available: true
            });
          }
        }
      }
    }
    
    console.log(`Inserting ${slotsToInsert.length} slots...`);
    
    // Insert slots in batches to avoid hitting limits
    const batchSize = 100;
    for (let i = 0; i < slotsToInsert.length; i += batchSize) {
      const batch = slotsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('doctor_slots')
        .insert(batch);
      
      if (insertError) {
        console.error('Error inserting batch:', insertError);
        return;
      }
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(slotsToInsert.length / batchSize)}`);
    }
    
    // Verify the insertion
    const { data: verifySlots, error: verifyError } = await supabase
      .from('doctor_slots')
      .select('*')
      .limit(5);
    
    if (verifyError) {
      console.error('Error verifying slots:', verifyError);
      return;
    }
    
    console.log('Sample slots inserted:', verifySlots);
    console.log('Slot population completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
populateSlots().then(() => {
  console.log('Script finished');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});