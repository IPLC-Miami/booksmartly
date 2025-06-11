-- Create test users for production Playwright testing
-- This migration creates auth users with role metadata for testing purposes

DO $$
DECLARE
    admin_user_id uuid;
    client_user_id uuid;
    clinician_user_id uuid;
BEGIN
    -- Check and insert admin user
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'iplcmiami@gmail.com';
    IF admin_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'iplcmiami@gmail.com',
            crypt('Iplcmiami1', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin"}',
            false,
            'authenticated'
        );
    END IF;

    -- Check and insert client user
    SELECT id INTO client_user_id FROM auth.users WHERE email = 'pdarleyjr@gmail.com';
    IF client_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'pdarleyjr@gmail.com',
            crypt('Iplcmiami1', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "client"}',
            false,
            'authenticated'
        );
    END IF;

    -- Check and insert clinician user
    SELECT id INTO clinician_user_id FROM auth.users WHERE email = 'adarley23@gmail.com';
    IF clinician_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            'adarley23@gmail.com',
            crypt('Iplcmiami1', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "clinician"}',
            false,
            'authenticated'
        );
    END IF;
END $$;

-- Note: Role assignments to be done manually via Supabase dashboard if needed
-- The auth users are created with role metadata that should be sufficient for testing