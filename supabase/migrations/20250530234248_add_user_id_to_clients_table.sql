-- Add user_id column to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Add foreign key constraint to auth.users
-- It's good practice to name constraints explicitly
ALTER TABLE public.clients
ADD CONSTRAINT fk_clients_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add a unique constraint to user_id in clients table if a user should only have one client profile
-- Consider if this is desired. If a user can have multiple client profiles, skip this.
-- For now, I'll assume one user maps to one client profile.
ALTER TABLE public.clients
ADD CONSTRAINT uq_clients_user_id UNIQUE (user_id);

-- Update existing RLS policies for clients table if they need to reference user_id
-- For example, a common policy is that users can only see/edit their own client profile.

-- Drop existing policies first to avoid errors if they exist
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can insert their own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update their own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can delete their own data" ON public.clients;
-- Remove the old "Staff or Admin full access to clients" if it's being replaced or is no longer needed due to user_id linkage
-- Or update it if it's still relevant. For now, let's assume it might be superseded or needs review.
-- DROP POLICY IF EXISTS "Staff or Admin full access to clients" ON public.clients;


-- Policy: Authenticated users can select their own client record
CREATE POLICY "Clients can view their own data"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own client record
CREATE POLICY "Clients can insert their own data"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own client record
CREATE POLICY "Clients can update their own data"
ON public.clients
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own client record (optional, enable if needed)
CREATE POLICY "Clients can delete their own data"
ON public.clients
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- Re-grant permissions if they were affected by table alterations or policy changes
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clients TO authenticated;
GRANT ALL ON TABLE public.clients TO service_role;

COMMENT ON COLUMN public.clients.user_id IS 'Foreign key to auth.users table, linking client profile to an authenticated user.';