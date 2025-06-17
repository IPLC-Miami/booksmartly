-- Fix doctor_slots table structure before foreign key constraints
-- Created: 2025-06-17
-- Purpose: Ensure doctor_slots table has all required columns before adding foreign keys

-- =============================================================================
-- PHASE 1: CHECK AND ADD MISSING COLUMNS TO DOCTOR_SLOTS
-- =============================================================================

DO $$
BEGIN
    -- Add schedule_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctor_slots' 
        AND column_name = 'schedule_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.doctor_slots ADD COLUMN schedule_id uuid;
        RAISE NOTICE 'Added schedule_id column to doctor_slots table';
    ELSE
        RAISE NOTICE 'schedule_id column already exists in doctor_slots table';
    END IF;

    -- Add appointment_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctor_slots' 
        AND column_name = 'appointment_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.doctor_slots ADD COLUMN appointment_id uuid;
        RAISE NOTICE 'Added appointment_id column to doctor_slots table';
    ELSE
        RAISE NOTICE 'appointment_id column already exists in doctor_slots table';
    END IF;

    -- Add slot_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctor_slots' 
        AND column_name = 'slot_date' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.doctor_slots ADD COLUMN slot_date date NOT NULL DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Added slot_date column to doctor_slots table';
    ELSE
        RAISE NOTICE 'slot_date column already exists in doctor_slots table';
    END IF;

    -- Add is_available column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctor_slots' 
        AND column_name = 'is_available' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.doctor_slots ADD COLUMN is_available boolean DEFAULT true;
        RAISE NOTICE 'Added is_available column to doctor_slots table';
    ELSE
        RAISE NOTICE 'is_available column already exists in doctor_slots table';
    END IF;
END $$;

-- =============================================================================
-- PHASE 2: DROP EXISTING FOREIGN KEY CONSTRAINTS THAT MIGHT BE PROBLEMATIC
-- =============================================================================

DO $$
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctor_slots_schedule_id_fkey' 
        AND table_name = 'doctor_slots'
    ) THEN
        ALTER TABLE public.doctor_slots DROP CONSTRAINT doctor_slots_schedule_id_fkey;
        RAISE NOTICE 'Dropped existing doctor_slots_schedule_id_fkey constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctor_slots_appointment_id_fkey' 
        AND table_name = 'doctor_slots'
    ) THEN
        ALTER TABLE public.doctor_slots DROP CONSTRAINT doctor_slots_appointment_id_fkey;
        RAISE NOTICE 'Dropped existing doctor_slots_appointment_id_fkey constraint';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctor_slots_clinician_id_fkey' 
        AND table_name = 'doctor_slots'
    ) THEN
        ALTER TABLE public.doctor_slots DROP CONSTRAINT doctor_slots_clinician_id_fkey;
        RAISE NOTICE 'Dropped existing doctor_slots_clinician_id_fkey constraint';
    END IF;
END $$;

-- =============================================================================
-- PHASE 3: ADD FOREIGN KEY CONSTRAINTS SAFELY
-- =============================================================================

DO $$
BEGIN
    -- Add foreign key to schedules table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedules' AND table_schema = 'public') THEN
        ALTER TABLE public.doctor_slots 
        ADD CONSTRAINT doctor_slots_schedule_id_fkey 
        FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint to schedules table';
    ELSE
        RAISE NOTICE 'schedules table does not exist, skipping foreign key constraint';
    END IF;

    -- Add foreign key to appointments table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments' AND table_schema = 'public') THEN
        ALTER TABLE public.doctor_slots 
        ADD CONSTRAINT doctor_slots_appointment_id_fkey 
        FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint to appointments table';
    ELSE
        RAISE NOTICE 'appointments table does not exist, skipping foreign key constraint';
    END IF;

    -- Add foreign key to clinicians table (check both clinicians and clinicians2)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinicians2' AND table_schema = 'public') THEN
        ALTER TABLE public.doctor_slots 
        ADD CONSTRAINT doctor_slots_clinician_id_fkey 
        FOREIGN KEY (clinician_id) REFERENCES public.clinicians2(user_id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to clinicians2 table';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinicians' AND table_schema = 'public') THEN
        ALTER TABLE public.doctor_slots 
        ADD CONSTRAINT doctor_slots_clinician_id_fkey 
        FOREIGN KEY (clinician_id) REFERENCES public.clinicians(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to clinicians table';
    ELSE
        RAISE NOTICE 'Neither clinicians nor clinicians2 table exists, skipping foreign key constraint';
    END IF;
END $$;

-- =============================================================================
-- PHASE 4: ADD CONSTRAINTS AND INDEXES
-- =============================================================================

-- Add check constraints if they don't exist
DO $$
BEGIN
    -- Add time check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctor_slots_time_check' 
        AND table_name = 'doctor_slots'
    ) THEN
        ALTER TABLE public.doctor_slots 
        ADD CONSTRAINT doctor_slots_time_check CHECK (end_time > start_time);
        RAISE NOTICE 'Added time check constraint to doctor_slots';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctor_slots_clinician_id ON public.doctor_slots(clinician_id);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_schedule_id ON public.doctor_slots(schedule_id);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_appointment_id ON public.doctor_slots(appointment_id);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_date ON public.doctor_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_available ON public.doctor_slots(is_available);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- This migration fixes:
-- ✅ Ensures doctor_slots table has all required columns
-- ✅ Safely drops and recreates foreign key constraints
-- ✅ Adds proper indexes for performance
-- ✅ Handles both clinicians and clinicians2 table scenarios