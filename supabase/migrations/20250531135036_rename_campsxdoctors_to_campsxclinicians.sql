-- Drop table if it exists with the old name (if any previous attempt created it)
DROP TABLE IF EXISTS public.campsxdoctors CASCADE;
-- Drop table if it exists with the new name for idempotency
DROP TABLE IF EXISTS public.campsxclinicians CASCADE;

-- Create the campsxclinicians table
CREATE TABLE IF NOT EXISTS public.campsxclinicians (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id uuid NOT NULL, -- We'll assume a 'camps' table will exist with this FK
    clinician_id uuid NOT NULL REFERENCES public.clinicians2(id) ON DELETE CASCADE,
    camp_start_date DATE NOT NULL,
    camp_end_date DATE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT uq_camp_clinician_start_date UNIQUE (camp_id, clinician_id, camp_start_date) -- Ensures a clinician isn't double-booked for the same camp start
);

-- Add a check constraint to ensure end_date is after start_date
ALTER TABLE public.campsxclinicians
ADD CONSTRAINT check_camp_dates CHECK (camp_end_date >= camp_start_date);

-- Enable Row Level Security
ALTER TABLE public.campsxclinicians ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campsxclinicians TO authenticated;
GRANT ALL ON TABLE public.campsxclinicians TO service_role;

-- RLS Policies (example, adjust as needed)
-- Policy: Authenticated users can view camp-clinician associations.
DROP POLICY IF EXISTS "Authenticated can view camp clinician associations" ON public.campsxclinicians;
CREATE POLICY "Authenticated can view camp clinician associations"
ON public.campsxclinicians
FOR SELECT
TO authenticated
USING (true); -- Or more restrictive if needed

-- Policy: Allow service role to manage (e.g., backend with elevated privileges)
DROP POLICY IF EXISTS "Service role can manage camp clinician associations" ON public.campsxclinicians;
CREATE POLICY "Service role can manage camp clinician associations"
ON public.campsxclinicians
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger to update 'updated_at' timestamp
DROP TRIGGER IF EXISTS update_campsxclinicians_updated_at ON public.campsxclinicians;
CREATE TRIGGER update_campsxclinicians_updated_at
BEFORE UPDATE ON public.campsxclinicians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.campsxclinicians IS 'Join table linking clinicians to health camps they volunteer for, including their volunteer dates.';
COMMENT ON COLUMN public.campsxclinicians.camp_id IS 'Foreign key to the camps table (to be created).';
COMMENT ON COLUMN public.campsxclinicians.clinician_id IS 'Foreign key to the clinicians2 table.';
COMMENT ON COLUMN public.campsxclinicians.camp_start_date IS 'Start date of the clinician''s volunteering period for the camp.';
COMMENT ON COLUMN public.campsxclinicians.camp_end_date IS 'End date of the clinician''s volunteering period for the camp.';