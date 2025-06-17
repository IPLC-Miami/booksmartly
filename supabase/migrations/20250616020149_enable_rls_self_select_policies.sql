-- Enable RLS on clinicians2 table (receptions table represents locations, not user accounts)
ALTER TABLE public.clinicians2 ENABLE ROW LEVEL SECURITY;

-- Create self-select policy for clinicians table
-- Allows authenticated users to read their own clinician profile
CREATE POLICY "Users can view their own clinician profile" ON public.clinicians2
    FOR SELECT USING (auth.uid() = user_id);

-- Admin users can view all clinician profiles
CREATE POLICY "Admin can view all clinician profiles" ON public.clinicians2
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE user_id = auth.uid()
        )
    );

-- Allow all authenticated users to view reception locations (they are public locations, not user accounts)
-- The receptions table already has a policy for this from its creation migration