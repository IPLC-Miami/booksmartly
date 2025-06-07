-- Complete Auth System Cleanup
-- This migration removes ALL existing auth components to prepare for new simplified auth system
-- WARNING: This will remove all existing auth data and policies

-- =====================================================
-- STEP 1: DISABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE IF EXISTS public.appointment_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinicians DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.camps DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campsxclinicians DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.healthcheckups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: DROP ALL EXISTING RLS POLICIES
-- =====================================================

-- Appointment Types Policies
DROP POLICY IF EXISTS "Authenticated users can read appointment_types" ON public.appointment_types;
DROP POLICY IF EXISTS "Staff or Admin full access to appointment_types" ON public.appointment_types;

-- Appointments Policies
DROP POLICY IF EXISTS "Enable clinicians to read their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable clinicians to update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable full access for staff or admin" ON public.appointments;

-- Clients Policies
DROP POLICY IF EXISTS "Staff or Admin full access to clients" ON public.clients;

-- Clinicians Policies
DROP POLICY IF EXISTS "Clinicians can read their own profile" ON public.clinicians;
DROP POLICY IF EXISTS "Clinicians can update their own profile" ON public.clinicians;
DROP POLICY IF EXISTS "Staff or Admin full access to clinicians" ON public.clinicians;

-- Test Reports Policies
DROP POLICY IF EXISTS "Users can insert own test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Clinicians can view their test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Clients can view own test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Users can update own test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Users can delete own test reports" ON public.test_reports;

-- Feedback Policies
DROP POLICY IF EXISTS "Clients can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Clinicians can view their feedback" ON public.feedback;

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

-- =====================================================
-- STEP 3: DROP AUTH-RELATED FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS public.get_appointment_dashboard();
DROP FUNCTION IF EXISTS public.get_analytics_data(date, date, text);
DROP FUNCTION IF EXISTS public.get_appointments_per_clinician();

-- =====================================================
-- STEP 4: REMOVE USER_ID COLUMNS AND DEPENDENCIES
-- =====================================================

-- First, drop any foreign key constraints that reference user_id columns
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all foreign key constraints that reference user_id columns
    FOR constraint_record IN
        SELECT
            tc.table_name,
            tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND tc.table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I',
                      constraint_record.table_name,
                      constraint_record.constraint_name);
    END LOOP;
END $$;

-- Now safely remove user_id columns
ALTER TABLE IF EXISTS public.clients DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS public.clinicians DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS public.receptions DROP COLUMN IF EXISTS user_id CASCADE;

-- =====================================================
-- STEP 5: DROP AUTH-RELATED TABLES
-- =====================================================

-- Drop tables that are purely auth-related
DROP TABLE IF EXISTS public.chat_messages CASCADE;

-- =====================================================
-- STEP 6: CLEAN UP VIEWS
-- =====================================================

DROP VIEW IF EXISTS public.appointment_dashboard CASCADE;

-- =====================================================
-- STEP 7: REMOVE AUTH METADATA DEPENDENCIES
-- =====================================================

-- Note: We cannot directly modify auth.users table, but we'll handle this in the application layer
-- The new auth system will not rely on user_metadata, app_metadata, or raw_app_meta_data

-- =====================================================
-- STEP 8: ADD COMMENT FOR DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA public IS 'Schema cleaned of all auth components. Ready for new simplified auth system implementation.';

-- Auth cleanup completed successfully