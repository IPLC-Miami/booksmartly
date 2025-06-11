-- BOOKSMARTLY SCHEDULES AND DOCTOR SLOTS MIGRATION
-- Created: 2025-06-10
-- Purpose: Create schedules and doctor_slots tables for admin schedule management

-- =============================================================================
-- PHASE 1: CREATE SCHEDULES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id uuid NOT NULL REFERENCES public.clinicians2(user_id) ON DELETE CASCADE,
    day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT schedules_time_check CHECK (end_time > start_time),
    CONSTRAINT schedules_unique_clinician_day UNIQUE (clinician_id, day_of_week)
);

-- =============================================================================
-- PHASE 2: CREATE DOCTOR_SLOTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.doctor_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinician_id uuid NOT NULL REFERENCES public.clinicians2(user_id) ON DELETE CASCADE,
    slot_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_available boolean DEFAULT true,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT doctor_slots_time_check CHECK (end_time > start_time),
    CONSTRAINT doctor_slots_unique_clinician_slot UNIQUE (clinician_id, slot_date, start_time)
);

-- =============================================================================
-- PHASE 3: ENABLE RLS ON NEW TABLES
-- =============================================================================

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PHASE 4: CREATE RLS POLICIES FOR SCHEDULES TABLE
-- =============================================================================

-- ADMIN ROLE: Full access to all schedules
CREATE POLICY "admins_full_access_schedules" ON public.schedules
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- CLINICIAN ROLE: Can view/edit only their own schedules
CREATE POLICY "clinicians_select_own_schedules" ON public.schedules
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT user_id FROM public.clinicians2 WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clinicians_update_own_schedules" ON public.schedules
FOR UPDATE TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT user_id FROM public.clinicians2 WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT user_id FROM public.clinicians2 WHERE user_id = auth.uid()
  )
);

-- CLIENT ROLE: Can view active schedules (for appointment booking)
CREATE POLICY "clients_select_active_schedules" ON public.schedules
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'client' AND is_active = true
);

-- =============================================================================
-- PHASE 5: CREATE RLS POLICIES FOR DOCTOR_SLOTS TABLE
-- =============================================================================

-- ADMIN ROLE: Full access to all doctor slots
CREATE POLICY "admins_full_access_doctor_slots" ON public.doctor_slots
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- CLINICIAN ROLE: Can view/edit only their own slots
CREATE POLICY "clinicians_select_own_doctor_slots" ON public.doctor_slots
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT user_id FROM public.clinicians2 WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clinicians_update_own_doctor_slots" ON public.doctor_slots
FOR UPDATE TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT user_id FROM public.clinicians2 WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT user_id FROM public.clinicians2 WHERE user_id = auth.uid()
  )
);

-- CLIENT ROLE: Can view available slots (for appointment booking)
CREATE POLICY "clients_select_available_doctor_slots" ON public.doctor_slots
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'client' AND is_available = true
);

-- =============================================================================
-- PHASE 6: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for schedules table
CREATE INDEX IF NOT EXISTS idx_schedules_clinician_id ON public.schedules(clinician_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_of_week ON public.schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedules_active ON public.schedules(is_active);

-- Indexes for doctor_slots table
CREATE INDEX IF NOT EXISTS idx_doctor_slots_clinician_id ON public.doctor_slots(clinician_id);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_date ON public.doctor_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_available ON public.doctor_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_appointment_id ON public.doctor_slots(appointment_id);

-- =============================================================================
-- PHASE 7: CREATE UPDATE TRIGGERS
-- =============================================================================

CREATE OR REPLACE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_doctor_slots_updated_at
    BEFORE UPDATE ON public.doctor_slots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- This migration implements:
-- ✅ Created schedules table for clinician weekly schedules
-- ✅ Created doctor_slots table for specific time slot management
-- ✅ Implemented comprehensive RLS policies for admin, clinician, and client access
-- ✅ Added performance indexes
-- ✅ Added update triggers for timestamp management
-- ✅ Proper foreign key constraints and data validation