-- Fix Schedule Management Tables and Functions
-- Created: 2025-06-11
-- Purpose: Create missing helper functions and ensure schedule tables work properly

-- =============================================================================
-- PHASE 1: CREATE HELPER FUNCTIONS FOR RLS POLICIES
-- =============================================================================

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin role in metadata or is the specific admin email
  RETURN (
    ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text OR
    ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text OR
    auth.email() = 'iplcmiami@gmail.com'
  );
END;
$$;

-- Create get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return admin for specific email or check metadata
  IF auth.email() = 'iplcmiami@gmail.com' THEN
    RETURN 'admin';
  END IF;
  
  -- Check user_metadata first, then app_metadata
  RETURN COALESCE(
    (auth.jwt() -> 'user_metadata'::text) ->> 'role'::text,
    (auth.jwt() -> 'app_metadata'::text) ->> 'role'::text,
    'client'
  );
END;
$$;

-- =============================================================================
-- PHASE 2: CREATE SCHEDULES TABLE (IF NOT EXISTS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id uuid NOT NULL,
    day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT schedules_time_check CHECK (end_time > start_time),
    CONSTRAINT schedules_unique_clinician_day UNIQUE (clinician_id, day_of_week)
);

-- =============================================================================
-- PHASE 3: CREATE DOCTOR_SLOTS TABLE (IF NOT EXISTS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.doctor_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id uuid NOT NULL,
    schedule_id uuid,
    slot_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_available boolean DEFAULT true,
    appointment_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT doctor_slots_time_check CHECK (end_time > start_time),
    CONSTRAINT doctor_slots_unique_clinician_slot UNIQUE (clinician_id, slot_date, start_time)
);

-- =============================================================================
-- PHASE 4: ADD FOREIGN KEY CONSTRAINTS (IF NOT EXISTS)
-- =============================================================================

-- Add foreign key to clinicians2 if it exists, otherwise to clinicians
DO $$
BEGIN
    -- Check if clinicians2 table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinicians2' AND table_schema = 'public') THEN
        -- Add foreign key to clinicians2.user_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'schedules_clinician_id_fkey' 
            AND table_name = 'schedules'
        ) THEN
            ALTER TABLE public.schedules 
            ADD CONSTRAINT schedules_clinician_id_fkey 
            FOREIGN KEY (clinician_id) REFERENCES public.clinicians2(user_id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'doctor_slots_clinician_id_fkey' 
            AND table_name = 'doctor_slots'
        ) THEN
            ALTER TABLE public.doctor_slots 
            ADD CONSTRAINT doctor_slots_clinician_id_fkey 
            FOREIGN KEY (clinician_id) REFERENCES public.clinicians2(user_id) ON DELETE CASCADE;
        END IF;
    ELSE
        -- Add foreign key to clinicians.id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'schedules_clinician_id_fkey' 
            AND table_name = 'schedules'
        ) THEN
            ALTER TABLE public.schedules 
            ADD CONSTRAINT schedules_clinician_id_fkey 
            FOREIGN KEY (clinician_id) REFERENCES public.clinicians(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'doctor_slots_clinician_id_fkey' 
            AND table_name = 'doctor_slots'
        ) THEN
            ALTER TABLE public.doctor_slots 
            ADD CONSTRAINT doctor_slots_clinician_id_fkey 
            FOREIGN KEY (clinician_id) REFERENCES public.clinicians(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add other foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctor_slots_schedule_id_fkey' 
        AND table_name = 'doctor_slots'
    ) THEN
        ALTER TABLE public.doctor_slots 
        ADD CONSTRAINT doctor_slots_schedule_id_fkey 
        FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctor_slots_appointment_id_fkey' 
        AND table_name = 'doctor_slots'
    ) THEN
        ALTER TABLE public.doctor_slots 
        ADD CONSTRAINT doctor_slots_appointment_id_fkey 
        FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================================================
-- PHASE 5: ENABLE RLS AND CREATE POLICIES
-- =============================================================================

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admins_full_access_schedules" ON public.schedules;
DROP POLICY IF EXISTS "admins_full_access_doctor_slots" ON public.doctor_slots;

-- Create admin policies for schedules
CREATE POLICY "admins_full_access_schedules" ON public.schedules
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create admin policies for doctor_slots
CREATE POLICY "admins_full_access_doctor_slots" ON public.doctor_slots
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- PHASE 6: CREATE INDEXES AND TRIGGERS
-- =============================================================================

-- Indexes for schedules table
CREATE INDEX IF NOT EXISTS idx_schedules_clinician_id ON public.schedules(clinician_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_of_week ON public.schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedules_active ON public.schedules(is_active);

-- Indexes for doctor_slots table
CREATE INDEX IF NOT EXISTS idx_doctor_slots_clinician_id ON public.doctor_slots(clinician_id);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_date ON public.doctor_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_available ON public.doctor_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_appointment_id ON public.doctor_slots(appointment_id);

-- Update triggers
CREATE OR REPLACE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_doctor_slots_updated_at
    BEFORE UPDATE ON public.doctor_slots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- PHASE 7: CREATE CLINICIANS ROUTE COMPATIBILITY
-- =============================================================================

-- Create a route for /api/clinicians that the schedule routes expect
-- This will be handled by creating a view or ensuring the clinicians2 table has the right structure

-- Grant permissions
GRANT ALL ON TABLE public.schedules TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.doctor_slots TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO anon, authenticated, service_role;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- This migration implements:
-- ✅ Created helper functions is_admin() and get_user_role()
-- ✅ Created schedules and doctor_slots tables with proper constraints
-- ✅ Added flexible foreign key constraints based on available tables
-- ✅ Implemented admin-only RLS policies
-- ✅ Added performance indexes and update triggers
-- ✅ Granted necessary permissions