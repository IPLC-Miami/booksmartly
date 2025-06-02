-- =====================================================
-- CureIt Integration Schema Migration (FIXED)
-- =====================================================
-- This migration implements the complete schema modifications
-- and RLS policies for CureIt integration as specified in
-- AI_IMPLEMENTATION_OUTLINE.md
-- FIXED: Updated all foreign key references to use UUID instead of INTEGER
-- =====================================================

-- =====================================================
-- SECTION 1: SCHEMA MODIFICATIONS FOR EXISTING TABLES
-- =====================================================

-- Add missing columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100),
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS medical_history TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(20) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to clinicians table
ALTER TABLE clinicians
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS specialization VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type_id UUID REFERENCES appointment_types(id),
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS consultation_type VARCHAR(20) DEFAULT 'in-person',
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to appointment_types table
ALTER TABLE appointment_types 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#007bff',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- SECTION 2: NEW TABLES
-- =====================================================

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_date DATE,
    payment_reference VARCHAR(100),
    notes TEXT,
    line_items JSONB DEFAULT '[]',
    stripe_invoice_id TEXT,
    currency TEXT NOT NULL DEFAULT 'usd',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
    CONSTRAINT invoices_amounts_check CHECK (
        subtotal >= 0 AND 
        tax_amount >= 0 AND 
        discount_amount >= 0 AND 
        total_amount >= 0
    )
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_method VARCHAR(20) NOT NULL DEFAULT 'email',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT reminders_type_check CHECK (type IN ('appointment', 'follow_up', 'medication', 'payment', 'general')),
    CONSTRAINT reminders_delivery_method_check CHECK (delivery_method IN ('email', 'sms', 'push', 'in_app')),
    CONSTRAINT reminders_status_check CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT analytics_events_event_type_check CHECK (
        event_type IN ('page_view', 'user_action', 'appointment', 'payment', 'system', 'error')
    )
);

-- Create messages table (for chat functionality)
CREATE TABLE IF NOT EXISTS messages (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_pictures table
CREATE TABLE IF NOT EXISTS profile_pictures (
    user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for clients table
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- Indexes for clinicians table
CREATE INDEX IF NOT EXISTS idx_clinicians_user_id ON clinicians(user_id);
CREATE INDEX IF NOT EXISTS idx_clinicians_specialization ON clinicians(specialization);
CREATE INDEX IF NOT EXISTS idx_clinicians_status ON clinicians(status);
CREATE INDEX IF NOT EXISTS idx_clinicians_rating ON clinicians(rating);

-- Indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinician_id ON appointments(clinician_id);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type_id ON appointments(appointment_type_id);

-- Indexes for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_clinician_id ON invoices(clinician_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON invoices(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Indexes for reminders table
CREATE INDEX IF NOT EXISTS idx_reminders_client_id ON reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_appointment_id ON reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(type);

-- Indexes for analytics_events table
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_appointment_id ON messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- =====================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_pictures ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CLIENTS TABLE RLS POLICIES
-- =====================================================

-- Clients can view and update their own records
CREATE POLICY "clients_own_records" ON clients
    FOR ALL USING (user_id = auth.uid());

-- Clinicians can view clients they have appointments with
CREATE POLICY "clinicians_view_their_clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN clinicians c ON c.id = a.clinician_id
            WHERE a.client_id = clients.id 
            AND c.user_id = auth.uid()
        )
    );

-- =====================================================
-- CLINICIANS TABLE RLS POLICIES
-- =====================================================

-- Clinicians can view and update their own records
CREATE POLICY "clinicians_own_records" ON clinicians
    FOR ALL USING (user_id = auth.uid());

-- All authenticated users can view active clinicians (for booking)
CREATE POLICY "users_view_active_clinicians" ON clinicians
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND status = 'active'
    );

-- =====================================================
-- APPOINTMENTS TABLE RLS POLICIES
-- =====================================================

-- Clients can view and manage their own appointments
CREATE POLICY "clients_own_appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = appointments.client_id 
            AND c.user_id = auth.uid()
        )
    );

-- Clinicians can view and manage their own appointments
CREATE POLICY "clinicians_own_appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinicians c
            WHERE c.id = appointments.clinician_id 
            AND c.user_id = auth.uid()
        )
    );

-- =====================================================
-- APPOINTMENT_TYPES TABLE RLS POLICIES
-- =====================================================

-- All authenticated users can view active appointment types
CREATE POLICY "users_view_appointment_types" ON appointment_types
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND is_active = true
    );

-- Clinicians can manage appointment types
CREATE POLICY "clinicians_manage_appointment_types" ON appointment_types
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinicians c
            WHERE c.user_id = auth.uid()
        )
    );

-- =====================================================
-- INVOICES TABLE RLS POLICIES
-- =====================================================

-- Clients can view their own invoices
CREATE POLICY "clients_view_own_invoices" ON invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = invoices.client_id 
            AND c.user_id = auth.uid()
        )
    );

-- Clinicians can view and manage invoices for their clients
CREATE POLICY "clinicians_manage_their_invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clinicians c
            WHERE c.id = invoices.clinician_id 
            AND c.user_id = auth.uid()
        )
    );

-- =====================================================
-- REMINDERS TABLE RLS POLICIES
-- =====================================================

-- Clients can view their own reminders
CREATE POLICY "clients_view_own_reminders" ON reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = reminders.client_id 
            AND c.user_id = auth.uid()
        )
    );

-- Clinicians can manage reminders for their clients
CREATE POLICY "clinicians_manage_client_reminders" ON reminders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN clinicians c ON c.id = a.clinician_id
            WHERE a.client_id = reminders.client_id 
            AND c.user_id = auth.uid()
        )
    );

-- =====================================================
-- ANALYTICS_EVENTS TABLE RLS POLICIES
-- =====================================================

-- Users can create their own analytics events
CREATE POLICY "users_create_own_analytics" ON analytics_events
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own analytics events
CREATE POLICY "users_view_own_analytics" ON analytics_events
    FOR SELECT USING (user_id = auth.uid());

-- Clinicians can view analytics for their clients
CREATE POLICY "clinicians_view_client_analytics" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN clinicians c ON c.id = a.clinician_id
            JOIN clients cl ON cl.id = a.client_id
            WHERE cl.user_id = analytics_events.user_id 
            AND c.user_id = auth.uid()
        )
    );

-- =====================================================
-- MESSAGES TABLE RLS POLICIES
-- =====================================================

-- Participants can select messages
CREATE POLICY "participants_select_messages" ON messages
    FOR SELECT USING (
        appointment_id IN (
            SELECT id FROM appointments
            WHERE (
                EXISTS (
                    SELECT 1 FROM clients c
                    WHERE c.id = appointments.client_id 
                    AND c.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM clinicians c
                    WHERE c.id = appointments.clinician_id 
                    AND c.user_id = auth.uid()
                )
            )
        )
    );

-- Participants can insert messages
CREATE POLICY "participants_insert_messages" ON messages
    FOR INSERT WITH CHECK (
        appointment_id IN (
            SELECT id FROM appointments
            WHERE (
                EXISTS (
                    SELECT 1 FROM clients c
                    WHERE c.id = appointments.client_id 
                    AND c.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM clinicians c
                    WHERE c.id = appointments.clinician_id 
                    AND c.user_id = auth.uid()
                )
            )
        )
        AND sender_id = auth.uid()
    );

-- =====================================================
-- PROFILE_PICTURES TABLE RLS POLICIES
-- =====================================================

-- User can select own profile picture
CREATE POLICY "user_select_own_profile_picture" ON profile_pictures
    FOR SELECT USING (user_id = auth.uid());

-- User can insert own profile picture
CREATE POLICY "user_insert_own_profile_picture" ON profile_pictures
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- User can update own profile picture
CREATE POLICY "user_update_own_profile_picture" ON profile_pictures
    FOR UPDATE USING (user_id = auth.uid());

-- User can delete own profile picture
CREATE POLICY "user_delete_own_profile_picture" ON profile_pictures
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- SECTION 5: ANALYTICS RPC FUNCTION
-- =====================================================

-- Create analytics data aggregation function
CREATE OR REPLACE FUNCTION get_analytics_data(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE,
    user_role TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    user_is_admin BOOLEAN;
    user_is_clinician BOOLEAN;
    current_user_id UUID;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();
    
    -- Check user permissions
    SELECT 
        COALESCE(u.raw_user_meta_data->>'role' = 'admin', FALSE),
        EXISTS(SELECT 1 FROM clinicians c WHERE c.user_id = current_user_id)
    INTO user_is_admin, user_is_clinician
    FROM auth.users u 
    WHERE u.id = current_user_id;
    
    -- Only allow access to authorized users
    IF NOT (user_is_admin OR user_is_clinician) THEN
        RAISE EXCEPTION 'Unauthorized access to analytics data';
    END IF;
    
    -- Build analytics data based on user permissions
    WITH base_data AS (
        SELECT 
            -- Appointment metrics
            COUNT(DISTINCT a.id) FILTER (WHERE a.created_at::DATE BETWEEN start_date AND end_date) as total_appointments,
            COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed' AND a.created_at::DATE BETWEEN start_date AND end_date) as completed_appointments,
            COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'cancelled' AND a.created_at::DATE BETWEEN start_date AND end_date) as cancelled_appointments,
            COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'no_show' AND a.created_at::DATE BETWEEN start_date AND end_date) as no_show_appointments,
            
            -- Client metrics
            COUNT(DISTINCT c.id) FILTER (WHERE c.created_at::DATE BETWEEN start_date AND end_date) as new_clients,
            COUNT(DISTINCT c.id) as total_clients,
            
            -- Revenue metrics (if user has access)
            CASE 
                WHEN user_is_admin THEN
                    COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'paid' AND i.issue_date BETWEEN start_date AND end_date), 0)
                ELSE 0
            END as total_revenue,
            
            CASE 
                WHEN user_is_admin THEN
                    COALESCE(SUM(i.total_amount) FILTER (WHERE i.status = 'pending' AND i.due_date < CURRENT_DATE), 0)
                ELSE 0
            END as overdue_amount,
            
            -- Clinician metrics
            COUNT(DISTINCT cl.id) as total_clinicians,
            COALESCE(AVG(cl.rating), 0) as average_clinician_rating
            
        FROM appointments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN clinicians cl ON cl.id = a.clinician_id
        LEFT JOIN invoices i ON i.appointment_id = a.id
        WHERE 
            -- Apply user-specific filters
            CASE 
                WHEN user_is_admin THEN TRUE
                WHEN user_is_clinician THEN cl.user_id = current_user_id
                ELSE FALSE
            END
    )
    SELECT json_build_object(
        'summary', (SELECT row_to_json(base_data) FROM base_data),
        'generated_at', NOW(),
        'date_range', json_build_object('start_date', start_date, 'end_date', end_date)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_analytics_data TO authenticated;

-- Create function to get appointments per clinician (legacy support)
CREATE OR REPLACE FUNCTION public.get_appointments_per_clinician()
RETURNS TABLE(clinician_id UUID, count BIGINT, clinician_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user has permission
    IF NOT EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid()
        AND (
            u.raw_user_meta_data->>'role' = 'admin'
            OR EXISTS(SELECT 1 FROM clinicians c WHERE c.user_id = auth.uid())
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized access';
    END IF;
    
    RETURN QUERY
    SELECT
        a.clinician_id,
        COUNT(*) as count,
        COALESCE(c.name, '') as clinician_name
    FROM appointments a
    JOIN clinicians c ON c.id = a.clinician_id
    GROUP BY a.clinician_id, c.name
    ORDER BY count DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_appointments_per_clinician TO authenticated;

-- =====================================================
-- SECTION 6: TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinicians_updated_at ON clinicians;
CREATE TRIGGER update_clinicians_updated_at BEFORE UPDATE ON clinicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointment_types_updated_at ON appointment_types;
CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON appointment_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 7: ADDITIONAL HELPER FUNCTIONS
-- =====================================================

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_month TEXT;
    sequence_num INTEGER;
BEGIN
    -- Format: INV-YYYYMM-XXXX
    year_month := TO_CHAR(CURRENT_DATE, 'YYYYMM');
    
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12 FOR 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '-%';
    
    -- Format with leading zeros
    new_number := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate appointment availability
CREATE OR REPLACE FUNCTION get_clinician_availability(
    p_clinician_id UUID,
    p_date DATE,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(
    time_slot TIME,
    is_available BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH time_slots AS (
        SELECT generate_series(
            '08:00:00'::TIME,
            '17:30:00'::TIME,
            (p_duration_minutes || ' minutes')::INTERVAL
        ) AS time_slot
    ),
    booked_slots AS (
        SELECT
            a.appointment_date::TIME as start_time,
            (a.appointment_date + (COALESCE(a.duration, 30) || ' minutes')::INTERVAL)::TIME as end_time
        FROM appointments a
        WHERE a.clinician_id = p_clinician_id
        AND a.appointment_date::DATE = p_date
        AND a.status NOT IN ('cancelled', 'no_show')
    )
    SELECT
        ts.time_slot,
        NOT EXISTS (
            SELECT 1 FROM booked_slots bs
            WHERE ts.time_slot >= bs.start_time
            AND ts.time_slot < bs.end_time
        ) as is_available
    FROM time_slots ts
    ORDER BY ts.time_slot;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_clinician_availability TO authenticated;

-- =====================================================
-- SECTION 8: STORAGE BUCKET POLICIES
-- =====================================================

-- Create storage bucket for patient records if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'patient-records',
    'patient-records',
    false,
    52428800, -- 50MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-pictures',
    'profile-pictures',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for patient-records bucket
CREATE POLICY "Clients can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'patient-records'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Clients can upload own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'patient-records'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Clinicians can view client files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'patient-records'
        AND EXISTS (
            SELECT 1 FROM appointments a
            JOIN clinicians c ON c.id = a.clinician_id
            JOIN clients cl ON cl.id = a.client_id
            WHERE c.user_id = auth.uid()
            AND cl.user_id::TEXT = (storage.foldername(name))[1]
        )
    );

-- Storage policies for profile-pictures bucket
CREATE POLICY "Users can upload own profile picture" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-pictures'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own profile picture" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-pictures'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own profile picture" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-pictures'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view profile pictures" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-pictures');

-- =====================================================
-- SECTION 9: FINAL COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE invoices IS 'Stores invoice information for appointments and services';
COMMENT ON TABLE reminders IS 'Stores appointment and follow-up reminders for clients';
COMMENT ON TABLE analytics_events IS 'Tracks user interactions and system events for analytics';
COMMENT ON TABLE messages IS 'Stores chat messages between clients and clinicians for appointments';
COMMENT ON TABLE profile_pictures IS 'Stores profile picture URLs for users';

COMMENT ON FUNCTION get_analytics_data IS 'Returns comprehensive analytics data based on user role and permissions';
COMMENT ON FUNCTION get_appointments_per_clinician IS 'Returns appointment count per clinician for analytics';
COMMENT ON FUNCTION generate_invoice_number IS 'Generates unique invoice numbers in format INV-YYYYMM-XXXX';
COMMENT ON FUNCTION get_clinician_availability IS 'Returns available time slots for a clinician on a specific date';

-- Migration completed successfully