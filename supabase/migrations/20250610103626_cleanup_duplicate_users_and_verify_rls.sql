-- CLEANUP DUPLICATE USERS AND VERIFY RLS STATUS
-- Created: 2025-06-10
-- Purpose: Remove duplicate/outdated users from previous project builds and verify RLS is enabled

-- =============================================================================
-- PHASE 1: CLEANUP DUPLICATE AUTH USERS (KEEP MOST RECENT)
-- =============================================================================

-- Remove duplicate auth users with same email (keep the most recent one)
-- Delete older duplicate accounts for iplcmiami@gmail.com (keep most recent)
DELETE FROM auth.users 
WHERE email = 'iplcmiami@gmail.com' 
AND id NOT IN (
    SELECT id FROM auth.users 
    WHERE email = 'iplcmiami@gmail.com' 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Delete older duplicate accounts for pdarleyjr@gmail.com (keep most recent)
DELETE FROM auth.users 
WHERE email = 'pdarleyjr@gmail.com' 
AND id NOT IN (
    SELECT id FROM auth.users 
    WHERE email = 'pdarleyjr@gmail.com' 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- =============================================================================
-- PHASE 2: CLEANUP ORPHANED RECORDS FROM ROLE TABLES (IF COLUMNS EXIST)
-- =============================================================================

-- Clean up orphaned admins (only if user_id column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admins' 
        AND column_name = 'user_id'
    ) THEN
        DELETE FROM public.admins 
        WHERE user_id IS NOT NULL 
        AND user_id NOT IN (SELECT id FROM auth.users);
    END IF;
END $$;

-- Clean up orphaned clinicians (only if user_id column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinicians' 
        AND column_name = 'user_id'
    ) THEN
        DELETE FROM public.clinicians 
        WHERE user_id IS NOT NULL 
        AND user_id NOT IN (SELECT id FROM auth.users);
    END IF;
END $$;

-- Clean up orphaned clients (only if user_id column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'user_id'
    ) THEN
        DELETE FROM public.clients 
        WHERE user_id IS NOT NULL 
        AND user_id NOT IN (SELECT id FROM auth.users);
    END IF;
END $$;

-- =============================================================================
-- PHASE 3: ENSURE PROPER ROLE ASSIGNMENTS FOR REMAINING USERS
-- =============================================================================

-- Get the current user IDs for our main accounts and ensure proper role assignments
DO $$
DECLARE
    admin_user_id UUID;
    client_user_id UUID;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'iplcmiami@gmail.com' LIMIT 1;
    
    -- Get the client user ID  
    SELECT id INTO client_user_id FROM auth.users WHERE email = 'pdarleyjr@gmail.com' LIMIT 1;
    
    -- Ensure admin role exists (only if admins table exists)
    IF admin_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admins'
    ) THEN
        INSERT INTO public.admins (user_id, email, first_name, last_name, created_at, updated_at)
        VALUES (admin_user_id, 'iplcmiami@gmail.com', 'IPLC', 'Admin', NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
    END IF;
    
    -- Ensure client role exists (only if clients table has user_id column)
    IF client_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'user_id'
    ) THEN
        INSERT INTO public.clients (user_id, email, full_name, created_at, updated_at)
        VALUES (client_user_id, 'pdarleyjr@gmail.com', 'Peter Darley Jr', NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
    END IF;
END $$;

-- =============================================================================
-- PHASE 4: VERIFY RLS STATUS ON ALL TABLES
-- =============================================================================

-- Show RLS status for all public tables
-- Expected result: All tables should have rowsecurity = true after RLS migration
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;