-- Drop table if it exists for idempotency during development
DROP TABLE IF EXISTS public.prescriptions CASCADE;

-- Create the prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES public.appointments2(id) ON DELETE CASCADE,
    medicines TEXT,
    clinician_notes TEXT,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Grant usage on the schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select, insert, update, delete on the table to authenticated users (will be restricted by RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.prescriptions TO authenticated;

-- Policies for prescriptions table

-- Policy: Authenticated users can select their own prescriptions (as clients)
-- Note: This policy will be updated after user_id is added to clients table
DROP POLICY IF EXISTS "Authenticated users can select their own prescriptions" ON public.prescriptions;
CREATE POLICY "Authenticated users can select their own prescriptions"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    WHERE a.id = prescriptions.appointment_id
    AND a.client_id IN (
      SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email')
    )
  )
);

-- Policy: Clinicians can select prescriptions for their appointments
DROP POLICY IF EXISTS "Clinicians can select prescriptions for their appointments" ON public.prescriptions;
CREATE POLICY "Clinicians can select prescriptions for their appointments"
ON public.prescriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = prescriptions.appointment_id
    AND cl.user_id = auth.uid()
  )
);

-- Policy: Clinicians can insert prescriptions for their appointments
DROP POLICY IF EXISTS "Clinicians can insert prescriptions for their appointments" ON public.prescriptions;
CREATE POLICY "Clinicians can insert prescriptions for their appointments"
ON public.prescriptions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = prescriptions.appointment_id
    AND cl.user_id = auth.uid()
  )
);

-- Policy: Clinicians can update prescriptions for their appointments
DROP POLICY IF EXISTS "Clinicians can update prescriptions for their appointments" ON public.prescriptions;
CREATE POLICY "Clinicians can update prescriptions for their appointments"
ON public.prescriptions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = prescriptions.appointment_id
    AND cl.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = prescriptions.appointment_id
    AND cl.user_id = auth.uid()
  )
);

-- Policy: Clinicians can delete prescriptions for their appointments (optional, consider if needed)
DROP POLICY IF EXISTS "Clinicians can delete prescriptions for their appointments" ON public.prescriptions;
CREATE POLICY "Clinicians can delete prescriptions for their appointments"
ON public.prescriptions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = prescriptions.appointment_id
    AND cl.user_id = auth.uid()
  )
);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.prescriptions IS 'Stores prescription details linked to appointments.';
COMMENT ON COLUMN public.prescriptions.appointment_id IS 'Foreign key to appointments2 table.';
COMMENT ON COLUMN public.prescriptions.medicines IS 'List of medicines prescribed, can be plain text or JSON.';
COMMENT ON COLUMN public.prescriptions.clinician_notes IS 'Notes from the clinician regarding the prescription.';