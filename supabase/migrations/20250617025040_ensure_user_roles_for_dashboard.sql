-- CORRECTED: Ensure User Roles for Dashboard Testing
-- Created: 2025-06-17 (CORRECTED)
-- Purpose: Ensure iplcmiami@gmail.com has proper role assignments for testing all dashboard types
-- FIXED: Match actual table structures from existing migrations

-- =============================================================================
-- PHASE 1: ADD MISSING user_id COLUMN TO RECEPTIONS TABLE
-- =============================================================================

-- The receptions table currently only has: id, name, address, phone, created_at, updated_at
-- We need to add user_id column to support role-based authentication
ALTER TABLE public.receptions
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add unique constraint for one-to-one mapping
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'uq_receptions_user_id'
        AND table_name = 'receptions'
    ) THEN
        ALTER TABLE public.receptions
        ADD CONSTRAINT uq_receptions_user_id UNIQUE (user_id);
    END IF;
END $$;

-- =============================================================================
-- PHASE 2: ENSURE USER ROLE ASSIGNMENTS
-- =============================================================================

DO $$
DECLARE
    target_user_id uuid;
    target_email text := 'iplcmiami@gmail.com';
BEGIN
    -- Try to get the user ID from auth.users
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email
    LIMIT 1;
    
    -- If user exists, ensure they have role assignments
    IF target_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found user % with ID %', target_email, target_user_id;
        
        -- =============================================================================
        -- PHASE 3: ENSURE ADMIN ROLE (using correct column names)
        -- =============================================================================
        
        -- Insert into admins table if not exists (using first_name, last_name, email)
        INSERT INTO public.admins (user_id, first_name, last_name, email, phone, department, created_at, updated_at)
        VALUES (
            target_user_id,
            'IPLC',
            'Admin',
            target_email,
            '+1-305-555-0100',
            'Administration',
            now(),
            now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            department = EXCLUDED.department,
            updated_at = now();
        
        RAISE NOTICE 'Ensured admin role for user %', target_email;
        
        -- =============================================================================
        -- PHASE 4: ENSURE RECEPTION ROLE (using correct column names)
        -- =============================================================================
        
        -- Insert into receptions table if not exists (using name, address, phone, user_id)
        INSERT INTO public.receptions (user_id, name, address, phone, created_at, updated_at)
        VALUES (
            target_user_id,
            'IPLC Reception Desk',
            '2780 SW 37th Ave #203, Miami, FL 33133',
            '+1-305-555-0200',
            now(),
            now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            phone = EXCLUDED.phone,
            updated_at = now();
        
        RAISE NOTICE 'Ensured reception role for user %', target_email;
        
        -- =============================================================================
        -- PHASE 5: ENSURE CLINICIAN ROLE (using correct column names)
        -- =============================================================================
        
        -- Insert into clinicians2 table if not exists (using actual column names from migration)
        INSERT INTO public.clinicians2 (
            user_id,
            specialty,
            experience_years,
            hospital_name,
            license_number,
            bio,
            office_address,
            consultation_fees,
            education,
            experience,
            created_at,
            updated_at
        )
        VALUES (
            target_user_id,
            'General Practice',
            '10',
            'IPLC Medical Center',
            'FL-GP-12345',
            'Experienced general practitioner specializing in comprehensive healthcare.',
            '2780 SW 37th Ave #203, Miami, FL 33133',
            150.00,
            'MD from University of Miami',
            'Over 10 years of clinical experience in general practice and preventive care.',
            now(),
            now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            specialty = EXCLUDED.specialty,
            experience_years = EXCLUDED.experience_years,
            hospital_name = EXCLUDED.hospital_name,
            license_number = EXCLUDED.license_number,
            bio = EXCLUDED.bio,
            office_address = EXCLUDED.office_address,
            consultation_fees = EXCLUDED.consultation_fees,
            education = EXCLUDED.education,
            experience = EXCLUDED.experience,
            updated_at = now();
        
        RAISE NOTICE 'Ensured clinician role for user %', target_email;
        
        -- =============================================================================
        -- PHASE 6: ENSURE CLIENT ROLE (using user_id column with required NOT NULL fields)
        -- =============================================================================
        
        -- Insert into clients table if not exists (clients table has NOT NULL constraints on first_name, last_name, email)
        INSERT INTO public.clients (
            user_id,
            first_name,
            last_name,
            email,
            phone,
            created_at,
            updated_at
        )
        VALUES (
            target_user_id,
            'IPLC',
            'Client',
            target_email,
            '+1-305-555-0300',
            now(),
            now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            updated_at = now();
        
        RAISE NOTICE 'Ensured client role for user %', target_email;
        
        -- =============================================================================
        -- PHASE 7: UPDATE USER METADATA
        -- =============================================================================
        
        -- Update the user's metadata to include admin role as primary
        UPDATE auth.users
        SET
            raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
            updated_at = now()
        WHERE id = target_user_id;
        
        RAISE NOTICE 'Updated user metadata for %', target_email;
        
    ELSE
        RAISE NOTICE 'User % not found in auth.users table', target_email;
        RAISE NOTICE 'User must be created through the authentication system first';
    END IF;
    
END $$;

-- =============================================================================
-- PHASE 8: CREATE TEST FUNCTION TO VERIFY ROLES
-- =============================================================================

-- Create a function to test role detection for the user
CREATE OR REPLACE FUNCTION public.test_user_roles(user_email text DEFAULT 'iplcmiami@gmail.com')
RETURNS TABLE (
    role_type text,
    exists_in_table boolean,
    user_id uuid,
    details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get user ID
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RETURN QUERY SELECT 'error'::text, false, null::uuid, '{"message": "User not found"}'::jsonb;
        RETURN;
    END IF;
    
    -- Check admin role
    RETURN QUERY
    SELECT
        'admin'::text,
        EXISTS(SELECT 1 FROM public.admins WHERE admins.user_id = target_user_id),
        target_user_id,
        COALESCE(
            (SELECT to_jsonb(admins.*) FROM public.admins WHERE admins.user_id = target_user_id LIMIT 1),
            '{}'::jsonb
        );
    
    -- Check reception role (now with user_id column)
    RETURN QUERY
    SELECT
        'reception'::text,
        EXISTS(SELECT 1 FROM public.receptions WHERE receptions.user_id = target_user_id),
        target_user_id,
        COALESCE(
            (SELECT to_jsonb(receptions.*) FROM public.receptions WHERE receptions.user_id = target_user_id LIMIT 1),
            '{}'::jsonb
        );
    
    -- Check clinician role
    RETURN QUERY
    SELECT
        'clinician'::text,
        EXISTS(SELECT 1 FROM public.clinicians2 WHERE clinicians2.user_id = target_user_id),
        target_user_id,
        COALESCE(
            (SELECT to_jsonb(clinicians2.*) FROM public.clinicians2 WHERE clinicians2.user_id = target_user_id LIMIT 1),
            '{}'::jsonb
        );
    
    -- Check client role
    RETURN QUERY
    SELECT
        'client'::text,
        EXISTS(SELECT 1 FROM public.clients WHERE clients.user_id = target_user_id),
        target_user_id,
        COALESCE(
            (SELECT to_jsonb(clients.*) FROM public.clients WHERE clients.user_id = target_user_id LIMIT 1),
            '{}'::jsonb
        );
    
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.test_user_roles(text) TO anon, authenticated, service_role;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- This CORRECTED migration implements:
-- ✅ Adds missing user_id column to receptions table
-- ✅ Uses correct column names for all tables (first_name/last_name for admins, etc.)
-- ✅ Ensures iplcmiami@gmail.com has entries in all role tables (admins, receptions, clinicians2, clients)
-- ✅ Updates user metadata to include admin role
-- ✅ Creates a test function to verify role assignments
-- ✅ Handles conflicts gracefully with ON CONFLICT DO UPDATE
-- ✅ Provides detailed logging of operations

-- To test the roles after migration, run:
-- SELECT * FROM public.test_user_roles('iplcmiami@gmail.com');