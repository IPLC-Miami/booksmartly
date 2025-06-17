-- Add missing users to role tables
-- iplcmiami@gmail.com should be an admin (using correct user ID from documentation)
-- Only insert if the user exists in auth.users table

-- Insert admin user if exists in auth.users
INSERT INTO public.admins (user_id, email, first_name, last_name, created_at, updated_at)
SELECT '58d83ac4-e027-44a9-a4f8-799d52955a0f', 'iplcmiami@gmail.com', 'Admin', 'User', NOW(), NOW()
WHERE EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = '58d83ac4-e027-44a9-a4f8-799d52955a0f'
)
AND NOT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = '58d83ac4-e027-44a9-a4f8-799d52955a0f'
);

-- Note: Client user insertion removed as we don't have confirmed user ID
-- This should be handled through proper user registration flow