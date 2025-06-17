-- Clean up confusing table naming and remove unnecessary tables
-- This migration standardizes clinician-related tables

-- Step 1: Drop the old clinicians table (without user_id) since clinicians2 is the correct one
DROP TABLE IF EXISTS clinicians CASCADE;

-- Step 2: Rename clinicians2 to clinicians (the standard name)
ALTER TABLE clinicians2 RENAME TO clinicians;

-- Step 3: Rename doctor_slots to clinician_slots (no doctors in this practice!)
ALTER TABLE doctor_slots RENAME TO clinician_slots;

-- Step 4: Update any foreign key references that might exist
-- Update schedules table to reference the correct clinician table
-- (The schedules table already references clinician_id correctly)

-- Step 5: Add any missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinicians_user_id ON clinicians(user_id);
CREATE INDEX IF NOT EXISTS idx_clinician_slots_clinician_id ON clinician_slots(clinician_id);

-- Step 6: Ensure RLS policies are in place for the renamed tables
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinician_slots ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for clinicians
CREATE POLICY "Clinicians can view their own data" ON clinicians
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clinicians" ON clinicians
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- Create basic RLS policies for clinician_slots
CREATE POLICY "Clinicians can view their own slots" ON clinician_slots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clinicians 
            WHERE id = clinician_slots.clinician_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all clinician slots" ON clinician_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- Step 7: Update any views or functions that might reference the old table names
-- (We'll handle this in the application code)

COMMENT ON TABLE clinicians IS 'Clinicians table - standardized from clinicians2';
COMMENT ON TABLE clinician_slots IS 'Clinician availability slots - renamed from doctor_slots';