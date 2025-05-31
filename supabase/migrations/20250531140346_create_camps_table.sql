-- Drop table if it exists for idempotency
DROP TABLE IF EXISTS public.camps CASCADE;

-- Create the camps table
CREATE TABLE IF NOT EXISTS public.camps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    health_worker_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who registered the camp
    camp_name TEXT NOT NULL,
    organizer_name TEXT,
    organizer_phone TEXT,
    organizer_email TEXT,
    camp_start_date DATE NOT NULL,
    camp_end_date DATE NOT NULL,
    location_address TEXT,
    latitude NUMERIC, -- For geolocation
    longitude NUMERIC, -- For geolocation
    target_audience TEXT,
    estimated_attendees INT,
    medical_services JSONB, -- Array of services offered, e.g., ["General Checkup", "SLP Screening"]
    
    -- File URLs from Supabase Storage
    camp_images TEXT, -- URL to camp image
    police_permission TEXT, -- URL to police permission document
    local_auth_permission TEXT, -- URL to local authority permission document
    other_documents TEXT, -- URL to other relevant documents

    -- Additional optional fields based on common needs for camp management
    registration_deadline DATE,
    camp_status VARCHAR(50) DEFAULT 'Planned', -- e.g., Planned, Active, Completed, Cancelled
    notes TEXT,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT check_camp_dates_camps CHECK (camp_end_date >= camp_start_date)
);

-- Enable Row Level Security
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.camps TO authenticated;
GRANT ALL ON TABLE public.camps TO service_role;

-- RLS Policies (examples, adjust as needed)
-- Policy: Authenticated users can view all camps.
DROP POLICY IF EXISTS "Authenticated can view camps" ON public.camps;
CREATE POLICY "Authenticated can view camps"
ON public.camps
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert camps if they are marked as a health worker (example, requires role setup in profiles or auth.users.app_metadata).
-- For now, let's allow any authenticated user to insert, assuming backend validation handles authorization.
DROP POLICY IF EXISTS "Authenticated users can insert camps" ON public.camps;
CREATE POLICY "Authenticated users can insert camps"
ON public.camps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = health_worker_id); -- Or a more general check if health_worker_id is not always the creator

-- Policy: Only the user who created the camp (health_worker_id) or an admin can update/delete.
DROP POLICY IF EXISTS "Camp creators or admin can update camps" ON public.camps;
CREATE POLICY "Camp creators or admin can update camps"
ON public.camps
FOR UPDATE
TO authenticated
USING (auth.uid() = health_worker_id OR (SELECT rolname FROM pg_roles WHERE oid = auth.role()::oid) = 'service_role') -- Simplified admin check
WITH CHECK (auth.uid() = health_worker_id OR (SELECT rolname FROM pg_roles WHERE oid = auth.role()::oid) = 'service_role');

DROP POLICY IF EXISTS "Camp creators or admin can delete camps" ON public.camps;
CREATE POLICY "Camp creators or admin can delete camps"
ON public.camps
FOR DELETE
TO authenticated
USING (auth.uid() = health_worker_id OR (SELECT rolname FROM pg_roles WHERE oid = auth.role()::oid) = 'service_role'); -- Simplified admin check


-- Add foreign key constraint from campsxclinicians to camps AFTER camps table is created
-- This will be done in the campsxclinicians migration or a new alteration migration.
-- For now, we ensure campsxclinicians.camp_id can be created.
-- The campsxclinicians migration already has:
-- camp_id uuid NOT NULL, -- We'll assume a 'camps' table will exist with this FK

-- Trigger to update 'updated_at' timestamp
DROP TRIGGER IF EXISTS update_camps_updated_at ON public.camps;
CREATE TRIGGER update_camps_updated_at
BEFORE UPDATE ON public.camps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.camps IS 'Stores information about health camps.';
COMMENT ON COLUMN public.camps.health_worker_id IS 'ID of the authenticated user (health worker) who registered the camp.';
COMMENT ON COLUMN public.camps.medical_services IS 'JSON array of medical services provided at the camp.';
COMMENT ON COLUMN public.camps.camp_images IS 'URL to the primary image for the camp.';
COMMENT ON COLUMN public.camps.camp_status IS 'Current status of the camp (e.g., Planned, Active, Completed).';