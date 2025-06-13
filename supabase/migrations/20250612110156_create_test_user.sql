-- Create test user in auth.users table only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@booksmartly.com') THEN
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          role,
          aud,
          confirmation_token,
          email_change_token_new,
          recovery_token,
          raw_app_meta_data,
          raw_user_meta_data,
          is_super_admin,
          last_sign_in_at,
          phone,
          phone_confirmed_at,
          phone_change,
          phone_change_token,
          phone_change_sent_at,
          email_change,
          email_change_token_current,
          email_change_confirm_status,
          banned_until,
          reauthentication_token,
          reauthentication_sent_at,
          is_sso_user,
          deleted_at
        ) VALUES (
          gen_random_uuid(),
          '00000000-0000-0000-0000-000000000000',
          'client@booksmartly.com',
          crypt('ClientPass123!', gen_salt('bf')),
          now(),
          now(),
          now(),
          'authenticated',
          'authenticated',
          '',
          '',
          '',
          '{"provider": "email", "providers": ["email"]}',
          '{"first_name": "Test", "last_name": "Client"}',
          false,
          now(),
          null,
          null,
          '',
          '',
          null,
          '',
          '',
          0,
          null,
          '',
          null,
          false,
          null
        );
    END IF;
END $$;

-- Get the user ID for the test user and create client record
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'client@booksmartly.com';
    
    -- Create corresponding client record only if it doesn't exist
    IF test_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.clients WHERE email = 'client@booksmartly.com') THEN
        INSERT INTO public.clients (
            id,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Test',
            'Client',
            'client@booksmartly.com',
            '+1234567890',
            '1990-01-01',
            now(),
            now()
        );
    END IF;
END $$;