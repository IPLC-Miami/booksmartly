-- Fix schema references and add missing advanced appointment features
-- This migration fixes broken foreign key references and adds missing functionality

-- 1. Fix feedback table references
DROP TABLE IF EXISTS public.feedback CASCADE;

CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- The user who GAVE the feedback
    clinician_id uuid REFERENCES public.clinicians(id) ON DELETE SET NULL, -- The clinician the feedback is FOR
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5), -- Optional: if you want a star rating
    tags JSONB, -- To store tags from the external API or your own system
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.feedback TO service_role;

-- Policies for feedback table
DROP POLICY IF EXISTS "Users can insert feedback for their appointments" ON public.feedback;
CREATE POLICY "Users can insert feedback for their appointments"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.appointments a
    JOIN public.clients c ON a.client_id = c.id
    WHERE a.id = feedback.appointment_id AND c.user_id = auth.uid()
  )
  AND feedback.user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can view their own submitted feedback" ON public.feedback;
CREATE POLICY "Users can view their own submitted feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clinicians can view feedback for their appointments" ON public.feedback;
CREATE POLICY "Clinicians can view feedback for their appointments"
ON public.feedback
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.id = feedback.appointment_id AND a.clinician_id = (
      SELECT id FROM public.clinicians WHERE user_id = auth.uid() LIMIT 1
    )
  )
);

-- Staff/Admin can view all feedback
DROP POLICY IF EXISTS "Staff and admin can view all feedback" ON public.feedback;
CREATE POLICY "Staff and admin can view all feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
);

-- Trigger to update 'updated_at' timestamp
DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Fix healthcheckups table references
DROP TABLE IF EXISTS public.healthcheckups CASCADE;

CREATE TABLE IF NOT EXISTS public.healthcheckups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL, -- The client who received the checkup
    camp_id uuid REFERENCES public.camps(id) ON DELETE SET NULL, -- Optional: if checkup done at a camp
    health_worker_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who performed/recorded the checkup
    checkup_date timestamptz DEFAULT now(),
    
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
    adl_assistance_level VARCHAR(100), -- Activities of Daily Living
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

-- RLS Policies
DROP POLICY IF EXISTS "Clients can view their own health checkups" ON public.healthcheckups;
CREATE POLICY "Clients can view their own health checkups"
ON public.healthcheckups
FOR SELECT
TO authenticated
USING (client_id = (SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1));

DROP POLICY IF EXISTS "Health workers can insert health checkups" ON public.healthcheckups;
CREATE POLICY "Health workers can insert health checkups"
ON public.healthcheckups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = health_worker_id);

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

-- Staff/Admin can access all health checkups
DROP POLICY IF EXISTS "Staff and admin can access all health checkups" ON public.healthcheckups;
CREATE POLICY "Staff and admin can access all health checkups"
ON public.healthcheckups
USING (
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
)
WITH CHECK (
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
);

-- Trigger to update 'updated_at' timestamp
DROP TRIGGER IF EXISTS update_healthcheckups_updated_at ON public.healthcheckups;
CREATE TRIGGER update_healthcheckups_updated_at
BEFORE UPDATE ON public.healthcheckups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add missing user_id column to clients table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
    END IF;
END $$;

-- 4. Add missing user_id column to clinicians table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinicians' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.clinicians ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_clinicians_user_id ON public.clinicians(user_id);
    END IF;
END $$;

-- 5. Add advanced appointment features
-- Add recurring appointment support
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments' 
        AND column_name = 'is_recurring'
    ) THEN
        ALTER TABLE public.appointments ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.appointments ADD COLUMN recurrence_pattern JSONB; -- Store recurrence rules
        ALTER TABLE public.appointments ADD COLUMN parent_appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL;
        ALTER TABLE public.appointments ADD COLUMN recurrence_end_date DATE;
        
        CREATE INDEX IF NOT EXISTS idx_appointments_recurring ON public.appointments(is_recurring);
        CREATE INDEX IF NOT EXISTS idx_appointments_parent ON public.appointments(parent_appointment_id);
    END IF;
END $$;

-- Add appointment reminders
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
    reminder_time timestamptz NOT NULL, -- When to send the reminder
    sent_at timestamptz, -- When it was actually sent
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointment_reminders TO authenticated;
GRANT ALL ON TABLE public.appointment_reminders TO service_role;

-- Staff/Admin can manage all reminders
DROP POLICY IF EXISTS "Staff and admin can manage reminders" ON public.appointment_reminders;
CREATE POLICY "Staff and admin can manage reminders"
ON public.appointment_reminders
USING (
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
)
WITH CHECK (
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
);

-- Add appointment waitlist
CREATE TABLE IF NOT EXISTS public.appointment_waitlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    clinician_id uuid REFERENCES public.clinicians(id) ON DELETE SET NULL,
    appointment_type_id uuid NOT NULL REFERENCES public.appointment_types(id) ON DELETE CASCADE,
    preferred_date_start DATE,
    preferred_date_end DATE,
    preferred_time_start TIME,
    preferred_time_end TIME,
    priority_level INT DEFAULT 1, -- 1 = low, 5 = high
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'fulfilled', 'cancelled'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.appointment_waitlist ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointment_waitlist TO authenticated;
GRANT ALL ON TABLE public.appointment_waitlist TO service_role;

-- Clients can manage their own waitlist entries
DROP POLICY IF EXISTS "Clients can manage their waitlist entries" ON public.appointment_waitlist;
CREATE POLICY "Clients can manage their waitlist entries"
ON public.appointment_waitlist
USING (client_id = (SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1))
WITH CHECK (client_id = (SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1));

-- Staff/Admin can manage all waitlist entries
DROP POLICY IF EXISTS "Staff and admin can manage all waitlist entries" ON public.appointment_waitlist;
CREATE POLICY "Staff and admin can manage all waitlist entries"
ON public.appointment_waitlist
USING (
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
)
WITH CHECK (
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_appointment_reminders_updated_at ON public.appointment_reminders;
CREATE TRIGGER update_appointment_reminders_updated_at
BEFORE UPDATE ON public.appointment_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointment_waitlist_updated_at ON public.appointment_waitlist;
CREATE TRIGGER update_appointment_waitlist_updated_at
BEFORE UPDATE ON public.appointment_waitlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Create function to handle recurring appointments
CREATE OR REPLACE FUNCTION public.create_recurring_appointments(
    base_appointment_id uuid,
    recurrence_pattern jsonb,
    end_date date
) RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    base_appointment RECORD;
    next_date date;
    interval_days int;
    created_count int := 0;
    new_appointment_id uuid;
BEGIN
    -- Get the base appointment
    SELECT * INTO base_appointment
    FROM public.appointments
    WHERE id = base_appointment_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Base appointment not found';
    END IF;
    
    -- Extract interval from recurrence pattern
    interval_days := (recurrence_pattern->>'interval_days')::int;
    
    IF interval_days IS NULL OR interval_days <= 0 THEN
        RAISE EXCEPTION 'Invalid recurrence interval';
    END IF;
    
    -- Create recurring appointments
    next_date := base_appointment.appointment_date::date + interval_days;
    
    WHILE next_date <= end_date LOOP
        INSERT INTO public.appointments (
            client_id,
            clinician_id,
            appointment_type_id,
            appointment_date,
            duration,
            status,
            notes,
            price,
            is_recurring,
            parent_appointment_id,
            recurrence_pattern
        ) VALUES (
            base_appointment.client_id,
            base_appointment.clinician_id,
            base_appointment.appointment_type_id,
            next_date + (base_appointment.appointment_date::time),
            base_appointment.duration,
            'scheduled',
            base_appointment.notes,
            base_appointment.price,
            true,
            base_appointment_id,
            recurrence_pattern
        ) RETURNING id INTO new_appointment_id;
        
        created_count := created_count + 1;
        next_date := next_date + interval_days;
    END LOOP;
    
    -- Update the base appointment to mark it as recurring
    UPDATE public.appointments 
    SET is_recurring = true, 
        recurrence_pattern = create_recurring_appointments.recurrence_pattern,
        recurrence_end_date = end_date
    WHERE id = base_appointment_id;
    
    RETURN created_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_recurring_appointments(uuid, jsonb, date) TO authenticated;

-- Add comments
COMMENT ON TABLE public.feedback IS 'Stores feedback submitted by users for appointments and clinicians.';
COMMENT ON TABLE public.healthcheckups IS 'Stores data collected during health checkups, potentially at camps or clinics.';
COMMENT ON TABLE public.appointment_reminders IS 'Stores scheduled reminders for appointments.';
COMMENT ON TABLE public.appointment_waitlist IS 'Stores client requests for appointments when preferred slots are not available.';
COMMENT ON FUNCTION public.create_recurring_appointments(uuid, jsonb, date) IS 'Creates recurring appointments based on a pattern.';