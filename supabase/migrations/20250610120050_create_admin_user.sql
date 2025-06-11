-- Create admin user migration
-- This migration creates the admin user for BookSmartly application

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'iplcmiami@gmail.com';
    
    -- If user doesn't exist, create it
    IF admin_user_id IS NULL THEN
        -- Insert into auth.users table
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
            deleted_at,
            is_anonymous
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
            FALSE,
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
            FALSE,
            NULL,
            FALSE
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Created admin user with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
    
    -- Check if admin record exists in public.admins table
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = admin_user_id) THEN
        -- Insert into public.admins table
        INSERT INTO public.admins (
            user_id,
            name,
            email,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'IPLC Miami Admin',
            'iplcmiami@gmail.com',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created admin record in public.admins table';
    ELSE
        RAISE NOTICE 'Admin record already exists in public.admins table';
    END IF;
    
END $$;

-- Verify the admin user was created successfully
DO $$
DECLARE
    user_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email = 'iplcmiami@gmail.com';
    SELECT COUNT(*) INTO admin_count FROM public.admins WHERE email = 'iplcmiami@gmail.com';
    
    RAISE NOTICE 'Verification: Found % user(s) and % admin record(s) for iplcmiami@gmail.com', user_count, admin_count;
    
    IF user_count = 0 OR admin_count = 0 THEN
        RAISE EXCEPTION 'Admin user creation failed - user_count: %, admin_count: %', user_count, admin_count;
    END IF;
END $$;