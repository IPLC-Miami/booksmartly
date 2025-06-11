-- Debug migration to check user metadata
-- This will show us what's actually stored in the auth.users table

DO $$
DECLARE
    user_record RECORD;
BEGIN
    RAISE NOTICE 'Checking user metadata for test users...';
    
    FOR user_record IN
        SELECT id, email, raw_user_meta_data, created_at
        FROM auth.users
        WHERE email IN ('iplcmiami@gmail.com', 'pdarleyjr@gmail.com', 'adarley23@gmail.com')
        ORDER BY email
    LOOP
        RAISE NOTICE 'User: % (ID: %)', user_record.email, user_record.id;
        RAISE NOTICE '  raw_user_meta_data: %', user_record.raw_user_meta_data;
        RAISE NOTICE '  created_at: %', user_record.created_at;
        RAISE NOTICE '---';
    END LOOP;
END $$;