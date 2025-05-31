-- Drop table if it exists for idempotency during development
DROP TABLE IF EXISTS public.feedback CASCADE;

-- Create the feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES public.appointments2(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- The user who GAVE the feedback
    clinician_id uuid REFERENCES public.clinicians2(id) ON DELETE SET NULL, -- The clinician the feedback is FOR
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Optional: if you want a star rating
    tags JSONB, -- To store tags from the external API or your own system
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Grant usage on the schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on the table to authenticated users (will be restricted by RLS policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.feedback TO service_role;


-- Policies for feedback table

-- Policy: Authenticated users can insert feedback for their own appointments.
-- We'll link the user_id automatically and check against the appointment's client.
DROP POLICY IF EXISTS "Users can insert feedback for their appointments" ON public.feedback;
CREATE POLICY "Users can insert feedback for their appointments"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clients c ON a.client_id = c.id
    WHERE a.id = feedback.appointment_id AND c.user_id = auth.uid()
  )
  AND feedback.user_id = auth.uid() -- Ensure the user_id in feedback matches the authenticated user
);

-- Policy: Users can view feedback they submitted.
DROP POLICY IF EXISTS "Users can view their own submitted feedback" ON public.feedback;
CREATE POLICY "Users can view their own submitted feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Clinicians can view feedback related to their appointments.
DROP POLICY IF EXISTS "Clinicians can view feedback for their appointments" ON public.feedback;
CREATE POLICY "Clinicians can view feedback for their appointments"
ON public.feedback
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments2 a
    JOIN public.clinicians2 cl ON a.clinician_id = cl.id
    WHERE a.id = feedback.appointment_id AND cl.user_id = auth.uid()
  )
  OR feedback.clinician_id = (SELECT id FROM public.clinicians2 WHERE user_id = auth.uid() LIMIT 1) -- Or if directly linked
);


-- Trigger to update 'updated_at' timestamp
-- (Assuming update_updated_at_column function already exists from previous migrations)
DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.feedback IS 'Stores feedback submitted by users for appointments and clinicians.';
COMMENT ON COLUMN public.feedback.appointment_id IS 'Foreign key to appointments2 table.';
COMMENT ON COLUMN public.feedback.user_id IS 'Foreign key to auth.users, identifies the user who submitted the feedback.';
COMMENT ON COLUMN public.feedback.clinician_id IS 'Foreign key to clinicians2, identifies the clinician the feedback is about.';
COMMENT ON COLUMN public.feedback.message IS 'The textual content of the feedback.';
COMMENT ON COLUMN public.feedback.rating IS 'Optional star rating (1-5).';
COMMENT ON COLUMN public.feedback.tags IS 'JSONB field to store tags or categories related to the feedback.';