-- Fix critical RLS security vulnerabilities
-- Replace user_metadata with raw_app_meta_data in security policies
-- user_metadata is editable by end users and should NEVER be used for security

-- 1. Fix appointments table RLS policy
DROP POLICY IF EXISTS "Enable full access for staff or admin" ON public.appointments;

CREATE POLICY "Enable full access for staff or admin" ON public.appointments
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

-- 2. Fix appointment_types table RLS policy
DROP POLICY IF EXISTS "Staff or Admin full access to appointment_types" ON public.appointment_types;

CREATE POLICY "Staff or Admin full access to appointment_types" ON public.appointment_types
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

-- 3. Fix clients table RLS policy
DROP POLICY IF EXISTS "Staff or Admin full access to clients" ON public.clients;

CREATE POLICY "Staff or Admin full access to clients" ON public.clients
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

-- 4. Fix clinicians table RLS policy
DROP POLICY IF EXISTS "Staff or Admin full access to clinicians" ON public.clinicians;

CREATE POLICY "Staff or Admin full access to clinicians" ON public.clinicians
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

-- 5. Address the security definer view issue
-- The appointment_dashboard view bypasses RLS policies
-- We need to add proper security checks or convert it to a security invoker view

-- Drop the existing view and recreate with proper security
DROP VIEW IF EXISTS public.appointment_dashboard;

-- Create a secure function instead of a security definer view
CREATE OR REPLACE FUNCTION public.get_appointment_dashboard()
RETURNS TABLE (
  id uuid,
  external_id text,
  start_time timestamptz,
  end_time timestamptz,
  status varchar(50),
  price numeric(10,2),
  paid boolean,
  amount_paid numeric(10,2),
  notes text,
  client_name text,
  client_phone varchar(20),
  client_email varchar(255),
  clinician_name varchar(255),
  specialization varchar(255),
  appointment_type varchar(255),
  duration_minutes integer,
  location_type text,
  scheduled_by text,
  date_scheduled timestamptz,
  date_rescheduled timestamptz,
  label varchar(100)
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Check if user has admin or staff role
  IF NOT (
    (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'staff'::text) OR 
    (((auth.jwt() -> 'raw_app_meta_data'::text) ->> 'role'::text) = 'admin'::text) OR
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'staff'::text) OR 
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or staff role required';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.id::text AS external_id,
    a.appointment_date AS start_time,
    (a.appointment_date + (a.duration || ' minutes')::interval) AS end_time,
    a.status,
    a.price,
    CASE WHEN a.price > 0 THEN true ELSE false END AS paid,
    a.price AS amount_paid,
    a.notes,
    concat(c.first_name, ' ', c.last_name) AS client_name,
    c.phone AS client_phone,
    c.email AS client_email,
    cl.name AS clinician_name,
    cl.specialty AS specialization,
    at.name AS appointment_type,
    a.duration AS duration_minutes,
    'in-person'::text AS location_type,
    'system'::text AS scheduled_by,
    a.created_at AS date_scheduled,
    a.updated_at AS date_rescheduled,
    at.category AS label
  FROM public.appointments a
  JOIN public.clients c ON a.client_id = c.id
  JOIN public.clinicians cl ON a.clinician_id = cl.id
  JOIN public.appointment_types at ON a.appointment_type_id = at.id
  ORDER BY a.appointment_date;
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_appointment_dashboard() TO authenticated;

-- Add comment explaining the security fix
COMMENT ON FUNCTION public.get_appointment_dashboard() IS 'Secure replacement for appointment_dashboard view. Uses SECURITY INVOKER and proper role checks with raw_app_meta_data instead of user_metadata.';

-- 6. Fix the get_analytics_data function to use raw_app_meta_data instead of raw_user_meta_data
CREATE OR REPLACE FUNCTION public.get_analytics_data(
  start_date date DEFAULT (CURRENT_DATE - '30 days'::interval),
  end_date date DEFAULT CURRENT_DATE,
  user_role text DEFAULT NULL::text
) 
RETURNS json
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
    
    -- Check user permissions using raw_app_meta_data (secure) instead of raw_user_meta_data
    SELECT 
        COALESCE(
          (u.raw_app_meta_data->>'role' = 'admin') OR 
          (u.app_metadata->>'role' = 'admin'), 
          FALSE
        ),
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

-- Add comment explaining the security fix
COMMENT ON FUNCTION public.get_analytics_data(date, date, text) IS 'Fixed to use raw_app_meta_data instead of raw_user_meta_data for security';