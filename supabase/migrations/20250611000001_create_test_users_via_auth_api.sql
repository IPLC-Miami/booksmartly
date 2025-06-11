-- Drop the previous test users first
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('iplcmiami@gmail.com', 'pdarleyjr@gmail.com', 'adarley23@gmail.com')
);
DELETE FROM auth.users WHERE email IN ('iplcmiami@gmail.com', 'pdarleyjr@gmail.com', 'adarley23@gmail.com');

-- Create a function to properly create auth users
CREATE OR REPLACE FUNCTION create_test_user(
  user_email text,
  user_password text,
  user_role text
) RETURNS uuid AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
BEGIN
  -- Generate a new user ID
  user_id := gen_random_uuid();
  
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('role', user_role),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Create the identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_id,
    jsonb_build_object('sub', user_id::text, 'email', user_email),
    'email',
    user_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the test users
SELECT create_test_user('iplcmiami@gmail.com', 'Iplcmiami1', 'admin');
SELECT create_test_user('pdarleyjr@gmail.com', 'Iplcmiami1', 'client');
SELECT create_test_user('adarley23@gmail.com', 'Iplcmiami1', 'clinician');

-- Drop the function after use
DROP FUNCTION create_test_user(text, text, text);