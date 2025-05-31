-- Drop table if it exists for idempotency
DROP TABLE IF EXISTS public.healthcheckups CASCADE;

-- Create the healthcheckups table
CREATE TABLE IF NOT EXISTS public.healthcheckups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL, -- The client who received the checkup
    camp_id uuid REFERENCES public.camps(id) ON DELETE SET NULL, -- Optional: if checkup done at a camp
    health_worker_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who performed/recorded the checkup
    checkup_date timestamptz DEFAULT now(),
    
    -- Common checkup fields (add/remove as needed based on actual form)
    -- Basic vitals
    height_cm NUMERIC,
    weight_kg NUMERIC,
    bmi NUMERIC, -- Can be calculated or stored
    temperature_celsius NUMERIC,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    oxygen_saturation_percent NUMERIC,

    -- Specific to SLP/OT or general health
    chief_complaint TEXT,
    medical_history TEXT, -- Relevant past history
    current_medications TEXT,
    allergies TEXT,
    
    -- SLP specific (examples)
    speech_clarity_rating INT CHECK (speech_clarity_rating >= 1 AND speech_clarity_rating <= 5),
    language_comprehension_notes TEXT,
    fluency_notes TEXT,
    voice_quality_notes TEXT,
    swallowing_concerns BOOLEAN,

    -- OT specific (examples)
    fine_motor_skills_notes TEXT,
    gross_motor_skills_notes TEXT,
    adl_assistance_level VARCHAR(100), -- Activities of Daily Living (e.g., Independent, Min Assist, Mod Assist, Max Assist)
    sensory_processing_notes TEXT,

    -- General observations/notes
    observations TEXT,
    recommendations TEXT,
    referral_needed BOOLEAN,
    referred_to TEXT, -- e.g., Specialist name, clinic

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.healthcheckups ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.healthcheckups TO authenticated;
GRANT ALL ON TABLE public.healthcheckups TO service_role;

-- RLS Policies (examples, adjust as needed)
-- Policy: Clients can view their own health checkup records.
DROP POLICY IF EXISTS "Clients can view their own health checkups" ON public.healthcheckups;
CREATE POLICY "Clients can view their own health checkups"
ON public.healthcheckups
FOR SELECT
TO authenticated
USING (client_id = (SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1));

-- Policy: Health workers can insert checkups (assuming they are authenticated).
DROP POLICY IF EXISTS "Health workers can insert health checkups" ON public.healthcheckups;
CREATE POLICY "Health workers can insert health checkups"
ON public.healthcheckups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = health_worker_id); -- Or a role-based check

-- Policy: Health workers who recorded the checkup can update/delete it.
DROP POLICY IF EXISTS "Recorders can update their health checkups" ON public.healthcheckups;
CREATE POLICY "Recorders can update their health checkups"
ON public.healthcheckups
FOR UPDATE
TO authenticated
USING (auth.uid() = health_worker_id)
WITH CHECK (auth.uid() = health_worker_id);

DROP POLICY IF EXISTS "Recorders can delete their health checkups" ON public.healthcheckups;
CREATE POLICY "Recorders can delete their health checkups"
ON public.healthcheckups
FOR DELETE
TO authenticated
USING (auth.uid() = health_worker_id);

-- Trigger to update 'updated_at' timestamp
DROP TRIGGER IF EXISTS update_healthcheckups_updated_at ON public.healthcheckups;
CREATE TRIGGER update_healthcheckups_updated_at
BEFORE UPDATE ON public.healthcheckups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.healthcheckups IS 'Stores data collected during health checkups, potentially at camps or clinics.';
COMMENT ON COLUMN public.healthcheckups.client_id IS 'Identifier for the client/patient.';
COMMENT ON COLUMN public.healthcheckups.camp_id IS 'Optional: Identifier for the camp where the checkup took place.';
COMMENT ON COLUMN public.healthcheckups.health_worker_id IS 'Identifier for the health worker who conducted/recorded the checkup.';