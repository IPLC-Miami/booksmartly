-- Migration: Align schema with codebase for clinician and appointment tables

-- Step 1: Create or Recreate 'clinicians2' table structure
-- Drop the table first if it exists to ensure the correct schema is applied.
DROP TABLE IF EXISTS public.clinicians2 CASCADE;

CREATE TABLE public.clinicians2 (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY, -- Auto-generated primary key
    user_id uuid NOT NULL UNIQUE,   -- Foreign key to auth.users.id, ensures one profile per user
    reception_id uuid,              -- To be linked to a 'receptions' table later if needed
    
    -- Fields based on existing 'clinicians' table and clinicianRoutes.js
    specialty TEXT,
    experience_years TEXT, -- Consider INTEGER if it's always a number
    hospital_name TEXT,
    available_from TIME,   -- Assuming TIME type for HH:MM format
    available_to TIME,     -- Assuming TIME type for HH:MM format
    license_number TEXT,   -- From original clinicians table structure
    is_active BOOLEAN DEFAULT true,

    -- Additional fields for a detailed clinician profile
    bio TEXT,
    office_address TEXT,
    consultation_fees NUMERIC(10,2),
    working_hours JSONB, -- e.g., {"monday": ["09:00-17:00"], "tuesday": ["09:00-12:00"]}
    education TEXT,      -- Degrees, certifications
    experience TEXT,     -- Narrative experience (distinct from experience_years if that's numeric)
    profile_picture_url TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT clinicians2_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.clinicians2 IS 'Stores detailed profile and operational data for clinicians, linked to auth.users via user_id.';

CREATE TRIGGER update_clinicians2_updated_at
BEFORE UPDATE ON public.clinicians2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.clinicians2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view their own clinicians2 profile"
ON public.clinicians2 FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can update their own clinicians2 profile"
ON public.clinicians2 FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TODO: Add admin/staff RLS policies for clinicians2 as needed.


-- Step 2: Create or Recreate 'appointments2' table structure
DROP TABLE IF EXISTS public.appointments2 CASCADE;

CREATE TABLE public.appointments2 (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    client_id uuid,             -- Foreign key to public.clients(id)
    clinician_id uuid NOT NULL, -- Foreign key to public.clinicians2(id) - THE AUTO-GENERATED ID
    appointment_type_id uuid,   -- Foreign key to public.appointment_types(id)
    
    appointment_date TIMESTAMPTZ NOT NULL,
    chosen_slot JSONB,          -- Expected: {"start_time": "HH:MM", "end_time": "HH:MM", "mode": "online/offline", ...}
    personal_details JSONB,     -- Expected: {"name": "...", "age": ..., "address": "...", "gender": "...", ...}
    
    status VARCHAR(50) DEFAULT 'scheduled', -- e.g., scheduled, completed, cancelled, arrival, in_progress
    book_status VARCHAR(50),    -- e.g., completed (for successful booking), pending, failed
    checked_in_status BOOLEAN DEFAULT false,
    
    notes TEXT,
    price NUMERIC(10,2),        -- Price for this specific appointment
    duration INTEGER,           -- Duration in minutes for this specific appointment

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT appointments2_clinician_id_fkey FOREIGN KEY (clinician_id) REFERENCES public.clinicians2(id) ON DELETE CASCADE,
    CONSTRAINT appointments2_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
    CONSTRAINT appointments2_appointment_type_id_fkey FOREIGN KEY (appointment_type_id) REFERENCES public.appointment_types(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.appointments2 IS 'Stores detailed appointment records for the application.';

CREATE TRIGGER update_appointments2_updated_at
BEFORE UPDATE ON public.appointments2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.appointments2 ENABLE ROW LEVEL SECURITY;

-- Assuming public.clients.id IS the auth.uid() for clients. If not, public.clients needs a user_id column.
CREATE POLICY "Users can view their own appointments (clients or clinicians)"
ON public.appointments2 FOR SELECT USING (auth.uid() = client_id OR auth.uid() = (SELECT user_id FROM public.clinicians2 WHERE id = clinician_id));

CREATE POLICY "Authenticated users can create appointments"
ON public.appointments2 FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Clinicians can update appointments they are assigned to"
ON public.appointments2 FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.clinicians2 WHERE id = clinician_id)) WITH CHECK (auth.uid() = (SELECT user_id FROM public.clinicians2 WHERE id = clinician_id));

-- TODO: Add more granular RLS, e.g., staff/admin policies, cancellation policies.

-- After this migration is applied:
-- 1. Populate 'clinicians2'. The 'user_id' column must match auth.users.id.
-- 2. Populate 'appointments2'. 'clinician_id' must match the new auto-generated 'id' from 'clinicians2'.
-- 3. Review original 'clinicians' and 'appointments' tables for potential archival/deletion.
-- 4. Consider creating a 'receptions' table.