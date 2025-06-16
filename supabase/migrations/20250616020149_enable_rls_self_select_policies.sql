-- Enable RLS on receptions and clinicians tables
ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicians2 ENABLE ROW LEVEL SECURITY;

-- Create self-select policy for receptions table
-- Allows authenticated users to read their own reception profile
CREATE POLICY "Users can view their own reception profile" ON public.receptions
    FOR SELECT USING (auth.uid() = user_id);

-- Create self-select policy for clinicians table  
-- Allows authenticated users to read their own clinician profile
CREATE POLICY "Users can view their own clinician profile" ON public.clinicians2
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admin role to read all profiles
-- Admin users can view all reception profiles
CREATE POLICY "Admin can view all reception profiles" ON public.receptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.role_users 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Admin users can view all clinician profiles
CREATE POLICY "Admin can view all clinician profiles" ON public.clinicians2
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.role_users 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );