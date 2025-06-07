-- BOOKSMARTLY AUTH SYSTEM SCHEMA AND RLS MIGRATION
-- Created: 2025-06-07
-- Purpose: Implement 3-role authentication system with comprehensive RLS policies
-- Roles: client, clinician, admin

-- =============================================================================
-- PHASE 1: SCHEMA CHANGES
-- =============================================================================

-- 1. Add missing user_id columns to tables
-- Add user_id to clients table if it doesn't exist
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id to clinicians table if it doesn't exist
ALTER TABLE public.clinicians
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add unique constraint for one-to-one mapping (using DO block for IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'uq_clinicians_user_id'
        AND table_name = 'clinicians'
    ) THEN
        ALTER TABLE public.clinicians
        ADD CONSTRAINT uq_clinicians_user_id UNIQUE (user_id);
    END IF;
END $$;

-- 2. Create dedicated admins table for admin role management
CREATE TABLE IF NOT EXISTS public.admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    phone varchar(20),
    department varchar(255),
    permissions jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT uq_admins_user_id UNIQUE (user_id)
);

-- 3. Create chat_messages table for real-time messaging with RLS
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    conversation_id uuid, -- For group conversations
    message text NOT NULL,
    message_type varchar(50) DEFAULT 'text', -- text, image, file, etc.
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Fix prescriptions table references (if needed)
ALTER TABLE public.prescriptions
DROP CONSTRAINT IF EXISTS prescriptions_appointment_id_fkey;

-- Clean up orphaned prescriptions before adding foreign key constraint
DELETE FROM public.prescriptions
WHERE appointment_id IS NOT NULL
AND appointment_id NOT IN (SELECT id FROM public.appointments);

ALTER TABLE public.prescriptions
ADD CONSTRAINT prescriptions_appointment_id_fkey
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;

-- =============================================================================
-- PHASE 2: HELPER FUNCTIONS FOR ROLE CHECKING
-- =============================================================================

-- Function to get user role from auth metadata
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    'client'
  );
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.get_user_role() = 'admin';
$$;

-- Function to check if user is clinician
CREATE OR REPLACE FUNCTION public.is_clinician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.get_user_role() IN ('clinician', 'admin');
$$;

-- Function to check if user is client
CREATE OR REPLACE FUNCTION public.is_client()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.get_user_role() IN ('client', 'clinician', 'admin');
$$;

-- =============================================================================
-- PHASE 3: ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PHASE 4: DROP ALL EXISTING POLICIES
-- =============================================================================

-- Drop existing client policies
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can insert their own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update their own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can delete their own data" ON public.clients;
DROP POLICY IF EXISTS "Staff or Admin full access to clients" ON public.clients;

-- Drop existing clinician policies
DROP POLICY IF EXISTS "Clinicians can read their own profile" ON public.clinicians;
DROP POLICY IF EXISTS "Clinicians can update their own profile" ON public.clinicians;
DROP POLICY IF EXISTS "Staff or Admin full access to clinicians" ON public.clinicians;

-- Drop existing appointment policies
DROP POLICY IF EXISTS "Enable clinicians to read their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable clinicians to update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Enable full access for staff or admin" ON public.appointments;

-- Drop existing appointment_types policies
DROP POLICY IF EXISTS "Authenticated users can read appointment_types" ON public.appointment_types;
DROP POLICY IF EXISTS "Staff or Admin full access to appointment_types" ON public.appointment_types;

-- Drop existing prescription policies
DROP POLICY IF EXISTS "Authenticated users can select their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Clinicians can select prescriptions for their appointments" ON public.prescriptions;
DROP POLICY IF EXISTS "Clinicians can insert prescriptions for their appointments" ON public.prescriptions;
DROP POLICY IF EXISTS "Clinicians can update prescriptions for their appointments" ON public.prescriptions;
DROP POLICY IF EXISTS "Clinicians can delete prescriptions for their appointments" ON public.prescriptions;

-- =============================================================================
-- PHASE 5: CLIENTS TABLE POLICIES
-- =============================================================================

-- CLIENT ROLE: Can view/edit only their own profile
CREATE POLICY "clients_select_own_data" ON public.clients
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() AND public.get_user_role() = 'client'
);

CREATE POLICY "clients_update_own_data" ON public.clients
FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.get_user_role() = 'client')
WITH CHECK (user_id = auth.uid() AND public.get_user_role() = 'client');

-- CLINICIAN ROLE: Can view assigned patients only
CREATE POLICY "clinicians_select_assigned_clients" ON public.clients
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.clinicians cl ON a.clinician_id = cl.id
    WHERE a.client_id = clients.id 
    AND cl.user_id = auth.uid()
  )
);

-- ADMIN ROLE: Full access to all client data
CREATE POLICY "admins_full_access_clients" ON public.clients
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- PHASE 6: CLINICIANS TABLE POLICIES
-- =============================================================================

-- CLINICIAN ROLE: Can view/edit only their own profile
CREATE POLICY "clinicians_select_own_profile" ON public.clinicians
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() AND public.get_user_role() = 'clinician'
);

CREATE POLICY "clinicians_update_own_profile" ON public.clinicians
FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.get_user_role() = 'clinician')
WITH CHECK (user_id = auth.uid() AND public.get_user_role() = 'clinician');

-- CLIENT ROLE: Can view clinicians (for appointment booking)
CREATE POLICY "clients_select_active_clinicians" ON public.clinicians
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'client' AND is_active = true
);

-- ADMIN ROLE: Full access to all clinician data
CREATE POLICY "admins_full_access_clinicians" ON public.clinicians
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- PHASE 7: ADMINS TABLE POLICIES
-- =============================================================================

-- ADMIN ROLE: Can view/edit only their own profile
CREATE POLICY "admins_select_own_profile" ON public.admins
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() AND public.get_user_role() = 'admin'
);

CREATE POLICY "admins_update_own_profile" ON public.admins
FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.get_user_role() = 'admin')
WITH CHECK (user_id = auth.uid() AND public.get_user_role() = 'admin');

-- SUPER ADMIN: Full access to all admin data (for user management)
CREATE POLICY "super_admins_full_access" ON public.admins
FOR ALL TO authenticated
USING (
  public.is_admin() AND 
  EXISTS (
    SELECT 1 FROM public.admins a 
    WHERE a.user_id = auth.uid() 
    AND (a.permissions ->> 'super_admin')::boolean = true
  )
);

-- =============================================================================
-- PHASE 8: APPOINTMENTS TABLE POLICIES
-- =============================================================================

-- CLIENT ROLE: Can view only their own appointments
CREATE POLICY "clients_select_own_appointments" ON public.appointments
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'client' AND
  client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);

-- CLIENT ROLE: Can insert new appointments for themselves
CREATE POLICY "clients_insert_own_appointments" ON public.appointments
FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role() = 'client' AND
  client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);

-- CLINICIAN ROLE: Can view/update assigned appointments
CREATE POLICY "clinicians_select_assigned_appointments" ON public.appointments
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT id FROM public.clinicians WHERE user_id = auth.uid()
  )
);

CREATE POLICY "clinicians_update_assigned_appointments" ON public.appointments
FOR UPDATE TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT id FROM public.clinicians WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  public.get_user_role() = 'clinician' AND
  clinician_id IN (
    SELECT id FROM public.clinicians WHERE user_id = auth.uid()
  )
);

-- ADMIN ROLE: Full access to all appointments
CREATE POLICY "admins_full_access_appointments" ON public.appointments
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- PHASE 9: APPOINTMENT_TYPES TABLE POLICIES
-- =============================================================================

-- ALL AUTHENTICATED USERS: Can view active appointment types
CREATE POLICY "authenticated_select_active_appointment_types" ON public.appointment_types
FOR SELECT TO authenticated
USING (is_active = true);

-- ADMIN ROLE: Full access to all appointment types
CREATE POLICY "admins_full_access_appointment_types" ON public.appointment_types
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- PHASE 10: PRESCRIPTIONS TABLE POLICIES
-- =============================================================================

-- CLIENT ROLE: Can view their own prescriptions
CREATE POLICY "clients_select_own_prescriptions" ON public.prescriptions
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'client' AND
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.clients c ON a.client_id = c.id
    WHERE a.id = prescriptions.appointment_id
    AND c.user_id = auth.uid()
  )
);

-- CLINICIAN ROLE: Can manage prescriptions for their appointments
CREATE POLICY "clinicians_manage_own_prescriptions" ON public.prescriptions
FOR ALL TO authenticated
USING (
  public.get_user_role() = 'clinician' AND
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.clinicians cl ON a.clinician_id = cl.id
    WHERE a.id = prescriptions.appointment_id
    AND cl.user_id = auth.uid()
  )
)
WITH CHECK (
  public.get_user_role() = 'clinician' AND
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.clinicians cl ON a.clinician_id = cl.id
    WHERE a.id = prescriptions.appointment_id
    AND cl.user_id = auth.uid()
  )
);

-- ADMIN ROLE: Full access to all prescriptions
CREATE POLICY "admins_full_access_prescriptions" ON public.prescriptions
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================================================
-- PHASE 11: CHAT_MESSAGES TABLE POLICIES
-- =============================================================================

-- Users can view messages they sent or received
CREATE POLICY "users_select_own_messages" ON public.chat_messages
FOR SELECT TO authenticated
USING (
  sender_id = auth.uid() OR 
  recipient_id = auth.uid() OR
  (conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.chat_messages cm
    WHERE cm.conversation_id = chat_messages.conversation_id
    AND (cm.sender_id = auth.uid() OR cm.recipient_id = auth.uid())
  ))
);

-- Users can insert messages they are sending
CREATE POLICY "users_insert_own_messages" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid());

-- Users can update their own messages (for editing/read status)
CREATE POLICY "users_update_own_messages" ON public.chat_messages
FOR UPDATE TO authenticated
USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
)
WITH CHECK (
  sender_id = auth.uid() OR
  (recipient_id = auth.uid() AND is_read = true)
);

-- ADMIN ROLE: Can view all messages for moderation
CREATE POLICY "admins_select_all_messages" ON public.chat_messages
FOR SELECT TO authenticated
USING (public.is_admin());

-- =============================================================================
-- PHASE 12: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_clinicians_user_id ON public.clinicians(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Index for chat message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient_id ON public.chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

-- Index for appointment queries
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinician_id ON public.appointments(clinician_id);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- This migration implements:
-- ✅ Added user_id column to clinicians table
-- ✅ Created admins table with proper structure
-- ✅ Created chat_messages table
-- ✅ Fixed prescriptions table foreign key references
-- ✅ Created helper functions for role checking
-- ✅ Implemented comprehensive RLS policies for all tables
-- ✅ Added performance indexes
-- ✅ Enabled RLS on all relevant tables

-- Next steps:
-- 1. Apply this migration: npx supabase db push
-- 2. Create admin accounts and link to admins table
-- 3. Link existing clinicians to auth.users
-- 4. Test all role-based access patterns