-- Create test users for production Playwright testing
-- This migration creates users through Supabase Auth functions

-- Delete existing test users if they exist
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('iplcmiami@gmail.com', 'pdarleyjr@gmail.com', 'adarley23@gmail.com')
);
DELETE FROM auth.users WHERE email IN ('iplcmiami@gmail.com', 'pdarleyjr@gmail.com', 'adarley23@gmail.com');

-- Create admin user
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'iplcmiami@gmail.com',
  crypt('Iplcmiami1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create client user
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'pdarleyjr@gmail.com',
  crypt('Iplcmiami1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "client"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create clinician user
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'adarley23@gmail.com',
  crypt('Iplcmiami1', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "clinician"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create corresponding entries in auth.identities for each user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email IN ('iplcmiami@gmail.com', 'pdarleyjr@gmail.com', 'adarley23@gmail.com');