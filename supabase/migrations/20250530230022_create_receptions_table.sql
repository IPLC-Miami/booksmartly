-- Migration: Create receptions table and link to clinicians2

-- Step 1: Create the 'receptions' table
CREATE TABLE IF NOT EXISTS public.receptions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.receptions IS 'Stores information about reception locations/desks.';

-- Add RLS and update trigger if receptions data will be managed by users
ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;

-- Example RLS: Allow authenticated users to read reception details
CREATE POLICY "Authenticated users can read reception info"
ON public.receptions FOR SELECT
TO authenticated
USING (true);

-- Example RLS: Allow only users with an 'admin' role to manage receptions
-- (Assumes you have a way to determine user roles, e.g., a custom claim 'user_role')
-- CREATE POLICY "Admins can manage receptions"
-- ON public.receptions FOR ALL
-- USING (get_my_claim('user_role') = '"admin"')
-- WITH CHECK (get_my_claim('user_role') = '"admin"');

CREATE TRIGGER update_receptions_updated_at
BEFORE UPDATE ON public.receptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 2: Add foreign key constraint from clinicians2 to receptions
-- Ensure this runs after the clinicians2 table is confirmed to exist from the previous migration.
-- The clinicians2.reception_id column should already exist.
ALTER TABLE public.clinicians2
ADD CONSTRAINT clinicians2_reception_id_fkey FOREIGN KEY (reception_id)
REFERENCES public.receptions(id) ON DELETE SET NULL;

-- Optional: Insert initial reception data
-- INSERT INTO public.receptions (name, address, phone)
-- VALUES ('IPLC', '2780 SW 37th Ave #203, Miami, FL 33133', '(786) 622-2353');