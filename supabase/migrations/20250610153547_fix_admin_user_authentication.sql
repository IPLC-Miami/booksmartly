-- Fix admin user authentication by properly setting up the user with correct password hash and required fields
-- This migration will delete the existing admin user and recreate it with proper Supabase authentication

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- First, remove existing admin user if it exists
    DELETE FROM public.admins WHERE user_id IN (
        SELECT id FROM auth.users WHERE email = 'iplcmiami@gmail.com'
    );
    
    DELETE FROM auth.users WHERE email = 'iplcmiami@gmail.com';
    
    -- Create a new admin user with proper Supabase authentication fields
    -- Using a more compatible password hash format
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'iplcmiami@gmail.com',
        crypt('IplcMiami2353', gen_salt('bf')),
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL
    ) RETURNING id INTO admin_user_id;
    
    -- Create the admin record in public.admins table with all required fields
    INSERT INTO public.admins (
        user_id,
        first_name,
        last_name,
        email,
        department,
        permissions,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Admin',
        'User',
        'iplcmiami@gmail.com',
        'System Administration',
        '{"super_admin": true, "full_access": true}',
        true,
        NOW(),
        NOW()
    );
    
    -- Output confirmation
    RAISE NOTICE 'Admin user recreated with ID: %', admin_user_id;
    RAISE NOTICE 'Admin user should now be able to authenticate properly';
    
END $$;

-- Verify the admin user was created correctly
DO $$
DECLARE
    user_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email = 'iplcmiami@gmail.com';
    SELECT COUNT(*) INTO admin_count FROM public.admins WHERE email = 'iplcmiami@gmail.com';
    
    RAISE NOTICE 'Verification: Found % user(s) and % admin record(s) for iplcmiami@gmail.com', user_count, admin_count;
    
    IF user_count = 1 AND admin_count = 1 THEN
        RAISE NOTICE '✅ Admin user authentication setup completed successfully';
    ELSE
        RAISE NOTICE '❌ Admin user setup verification failed';
    END IF;
END $$;