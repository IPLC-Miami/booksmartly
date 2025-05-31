-- Drop table if it exists for idempotency
DROP TABLE IF EXISTS public.test_reports CASCADE;

-- Create the test_reports table
CREATE TABLE IF NOT EXISTS public.test_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES public.appointments2(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL, -- Denormalized for easier querying by client
    clinician_id uuid REFERENCES public.clinicians2(id) ON DELETE SET NULL, -- Denormalized for easier querying by clinician
    test_name TEXT, -- Name of the test, e.g., "Audiology Report", "SLP Assessment Summary"
    test_date DATE NOT NULL,
    report_url TEXT NOT NULL, -- Path to the file in Supabase Storage
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who uploaded the report
    notes TEXT, -- Optional notes about the report
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_reports ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.test_reports TO authenticated;
GRANT ALL ON TABLE public.test_reports TO service_role;

-- RLS Policies (examples, adjust as needed)

-- Policy: Clients can view their own test reports.
DROP POLICY IF EXISTS "Clients can view their own test reports" ON public.test_reports;
CREATE POLICY "Clients can view their own test reports"
ON public.test_reports
FOR SELECT
TO authenticated
USING (client_id = (SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1));

-- Policy: Clinicians can view test reports associated with their appointments or directly linked to them.
DROP POLICY IF EXISTS "Clinicians can view relevant test reports" ON public.test_reports;
CREATE POLICY "Clinicians can view relevant test reports"
ON public.test_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = test_reports.appointment_id AND cl.user_id = auth.uid()
  )
  OR test_reports.clinician_id = (SELECT id FROM public.clinicians2 WHERE user_id = auth.uid() LIMIT 1)
);

-- Policy: Clinicians (or authorized staff) can insert test reports for their appointments.
DROP POLICY IF EXISTS "Authorized users can insert test reports" ON public.test_reports;
CREATE POLICY "Authorized users can insert test reports"
ON public.test_reports
FOR INSERT
TO authenticated
WITH CHECK (
  (EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = test_reports.appointment_id AND cl.user_id = auth.uid()
  ) OR test_reports.clinician_id = (SELECT id FROM public.clinicians2 WHERE user_id = auth.uid() LIMIT 1))
  AND test_reports.uploaded_by = auth.uid()
);

-- Policy: Users who uploaded a report can update/delete it (or clinicians associated).
DROP POLICY IF EXISTS "Uploaders or relevant clinicians can update test reports" ON public.test_reports;
CREATE POLICY "Uploaders or relevant clinicians can update test reports"
ON public.test_reports
FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = test_reports.appointment_id AND cl.user_id = auth.uid()
  )
  OR test_reports.clinician_id = (SELECT id FROM public.clinicians2 WHERE user_id = auth.uid() LIMIT 1)
)
WITH CHECK (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = test_reports.appointment_id AND cl.user_id = auth.uid()
  )
  OR test_reports.clinician_id = (SELECT id FROM public.clinicians2 WHERE user_id = auth.uid() LIMIT 1)
);

DROP POLICY IF EXISTS "Uploaders or relevant clinicians can delete test reports" ON public.test_reports;
CREATE POLICY "Uploaders or relevant clinicians can delete test reports"
ON public.test_reports
FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = test_reports.appointment_id AND cl.user_id = auth.uid()
  )
  OR test_reports.clinician_id = (SELECT id FROM public.clinicians2 WHERE user_id = auth.uid() LIMIT 1)
);


-- Trigger to update 'updated_at' timestamp
DROP TRIGGER IF EXISTS update_test_reports_updated_at ON public.test_reports;
CREATE TRIGGER update_test_reports_updated_at
BEFORE UPDATE ON public.test_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.test_reports IS 'Stores metadata and links to test report files.';
COMMENT ON COLUMN public.test_reports.appointment_id IS 'Foreign key to the appointments2 table.';
COMMENT ON COLUMN public.test_reports.client_id IS 'Denormalized client ID for easier access.';
COMMENT ON COLUMN public.test_reports.clinician_id IS 'Denormalized clinician ID for easier access.';
COMMENT ON COLUMN public.test_reports.report_url IS 'Path/URL to the report file in Supabase Storage.';
COMMENT ON COLUMN public.test_reports.uploaded_by IS 'User ID of the person who uploaded the report.';