-- Add missing users to role tables
-- iplcmiami@gmail.com should be an admin
-- pdarleyjr@gmail.com should be a client

INSERT INTO public.admins (user_id, email, first_name, last_name, created_at, updated_at)
VALUES ('617669c6-a757-4a70-9572-98f6264bcb57', 'iplcmiami@gmail.com', 'Admin', 'User', NOW(), NOW());

-- Check if user_id column exists in clients table, if not use id column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients'
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        INSERT INTO public.clients (user_id, email, first_name, last_name, created_at, updated_at)
        VALUES ('f80d8623-eedf-4871-8cc2-fb6c1697f0d2', 'pdarleyjr@gmail.com', 'Peter', 'Darley', NOW(), NOW());
    ELSE
        INSERT INTO public.clients (id, email, first_name, last_name, created_at, updated_at)
        VALUES ('f80d8623-eedf-4871-8cc2-fb6c1697f0d2', 'pdarleyjr@gmail.com', 'Peter', 'Darley', NOW(), NOW());
    END IF;
END $$;