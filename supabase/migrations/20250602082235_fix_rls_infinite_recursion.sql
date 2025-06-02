-- Fix for RLS Infinite Recursion Issue
-- This script removes problematic RLS policies that cause infinite recursion
-- and replaces them with simplified, non-recursive versions

-- =====================================================
-- STEP 1: DROP PROBLEMATIC POLICIES
-- =====================================================

-- Drop policies that cause infinite recursion due to complex subqueries
DROP POLICY IF EXISTS "Authorized users can insert test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Clinicians can view feedback for their appointments" ON public.feedback;
DROP POLICY IF EXISTS "Clinicians can view relevant test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Uploaders or relevant clinicians can delete test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Uploaders or relevant clinicians can update test reports" ON public.test_reports;
DROP POLICY IF EXISTS "Users can insert feedback for their appointments" ON public.feedback;

-- =====================================================
-- STEP 2: CREATE SIMPLIFIED, NON-RECURSIVE POLICIES
-- =====================================================

-- Test Reports Policies (Simplified)
-- Users can insert test reports if they uploaded them
CREATE POLICY "Users can insert own test reports" ON public.test_reports
    FOR INSERT TO authenticated 
    WITH CHECK (uploaded_by = auth.uid());

-- Clinicians can view test reports for their clinician_id
CREATE POLICY "Clinicians can view their test reports" ON public.test_reports
    FOR SELECT TO authenticated 
    USING (
        clinician_id = (
            SELECT id FROM public.clinicians2 
            WHERE user_id = auth.uid() 
            LIMIT 1
        )
    );

-- Clients can view their own test reports
CREATE POLICY "Clients can view own test reports" ON public.test_reports
    FOR SELECT TO authenticated 
    USING (
        client_id = (
            SELECT id FROM public.clients 
            WHERE user_id = auth.uid() 
            LIMIT 1
        )
    );

-- Users can update test reports they uploaded
CREATE POLICY "Users can update own test reports" ON public.test_reports
    FOR UPDATE TO authenticated 
    USING (uploaded_by = auth.uid())
    WITH CHECK (uploaded_by = auth.uid());

-- Users can delete test reports they uploaded
CREATE POLICY "Users can delete own test reports" ON public.test_reports
    FOR DELETE TO authenticated 
    USING (uploaded_by = auth.uid());

-- Feedback Policies (Simplified)
-- Users can insert feedback for appointments where they are the client
CREATE POLICY "Clients can insert feedback" ON public.feedback
    FOR INSERT TO authenticated 
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.appointments2 a
            JOIN public.clients c ON a.client_id = c.id
            WHERE a.id = feedback.appointment_id 
            AND c.user_id = auth.uid()
        )
    );

-- Clinicians can view feedback where they are the clinician
CREATE POLICY "Clinicians can view their feedback" ON public.feedback
    FOR SELECT TO authenticated 
    USING (
        clinician_id = (
            SELECT id FROM public.clinicians2 
            WHERE user_id = auth.uid() 
            LIMIT 1
        )
    );

-- =====================================================
-- STEP 3: ADD MISSING COLUMNS TO RESOLVE SCHEMA ISSUES
-- =====================================================

-- Add missing first_name column to clinicians table
ALTER TABLE public.clinicians 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);

-- Update existing clinicians to split name into first_name and last_name
UPDATE public.clinicians 
SET first_name = SPLIT_PART(name, ' ', 1)
WHERE first_name IS NULL;

-- Add missing email column to receptions table
ALTER TABLE public.receptions 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- =====================================================
-- STEP 4: CREATE MISSING CHAT_MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Users can view their own messages" ON public.chat_messages
    FOR SELECT TO authenticated 
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.chat_messages
    FOR INSERT TO authenticated 
    WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON public.chat_messages
    FOR UPDATE TO authenticated 
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- =====================================================
-- STEP 5: CREATE RPC FUNCTION FOR ANALYTICS
-- =====================================================

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS get_appointments_per_clinician();

CREATE OR REPLACE FUNCTION get_appointments_per_clinician()
RETURNS TABLE(
    clinician_id UUID,
    clinician_name TEXT,
    appointment_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Access denied: Authentication required';
    END IF;
    
    RETURN QUERY
    SELECT 
        c2.id as clinician_id,
        COALESCE(c.name, 'Unknown') as clinician_name,
        COUNT(a.id) as appointment_count
    FROM public.clinicians2 c2
    LEFT JOIN public.clinicians c ON c.id = c2.user_id
    LEFT JOIN public.appointments2 a ON a.clinician_id = c2.id
    GROUP BY c2.id, c.name
    ORDER BY appointment_count DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_appointments_per_clinician() TO authenticated;

COMMENT ON FUNCTION get_appointments_per_clinician() IS 'Returns appointment counts per clinician for analytics';