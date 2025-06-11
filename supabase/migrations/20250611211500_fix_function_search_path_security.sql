-- Fix Function Search Path Security Vulnerabilities
-- This migration addresses the "Function Search Path Mutable" security warnings
-- by setting explicit search_path for all affected functions

-- Fix is_clinician function
CREATE OR REPLACE FUNCTION public.is_clinician()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clinicians2 
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Fix is_client function
CREATE OR REPLACE FUNCTION public.is_client()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clients 
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Fix is_admin function (already exists but needs search_path)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role from auth.users metadata
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata' ->> 'role'),
    (auth.jwt() ->> 'app_metadata' ->> 'role')
  ) INTO user_role;
  
  -- Email-based fallback for iplcmiami@gmail.com
  IF user_role IS NULL AND auth.email() = 'iplcmiami@gmail.com' THEN
    user_role := 'admin';
  END IF;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Fix get_user_role function (already exists but needs search_path)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get user role from auth.users metadata
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata' ->> 'role'),
    (auth.jwt() ->> 'app_metadata' ->> 'role')
  ) INTO user_role;
  
  -- Email-based fallback for iplcmiami@gmail.com
  IF user_role IS NULL AND auth.email() = 'iplcmiami@gmail.com' THEN
    user_role := 'admin';
  END IF;
  
  RETURN user_role;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Fix generate_invoice_number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number integer;
  invoice_number text;
BEGIN
  -- Get the next invoice number (simple incrementing sequence)
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+') AS integer)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number ~ '^INV-[0-9]+$';
  
  -- Format as INV-000001, INV-000002, etc.
  invoice_number := 'INV-' || LPAD(next_number::text, 6, '0');
  
  RETURN invoice_number;
END;
$$;

-- Fix get_clinician_availability function
CREATE OR REPLACE FUNCTION public.get_clinician_availability(
  clinician_user_id uuid,
  start_date date,
  end_date date
)
RETURNS TABLE(
  available_date date,
  available_time time,
  is_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.date_val as available_date,
    t.time_val as available_time,
    NOT EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.clinician_id = clinician_user_id
      AND a.appointment_date = d.date_val
      AND a.appointment_time = t.time_val
      AND a.status != 'cancelled'
    ) as is_available
  FROM 
    generate_series(start_date, end_date, '1 day'::interval) d(date_val)
  CROSS JOIN 
    generate_series('09:00'::time, '17:00'::time, '30 minutes'::interval) t(time_val)
  ORDER BY d.date_val, t.time_val;
END;
$$;

-- Fix trigger_schema_refresh function
CREATE OR REPLACE FUNCTION public.trigger_schema_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can be used to trigger schema refresh operations
  -- Currently a placeholder for future schema refresh logic
  RAISE NOTICE 'Schema refresh triggered at %', NOW();
END;
$$;

-- Fix create_recurring_appointments function
CREATE OR REPLACE FUNCTION public.create_recurring_appointments(
  p_client_id uuid,
  p_clinician_id uuid,
  p_start_date date,
  p_end_date date,
  p_appointment_time time,
  p_recurrence_pattern text DEFAULT 'weekly'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  appointment_count integer := 0;
  appointment_date date := p_start_date;
  interval_step interval;
BEGIN
  -- Set interval based on recurrence pattern
  CASE p_recurrence_pattern
    WHEN 'daily' THEN interval_step := '1 day'::interval;
    WHEN 'weekly' THEN interval_step := '1 week'::interval;
    WHEN 'monthly' THEN interval_step := '1 month'::interval;
    ELSE interval_step := '1 week'::interval; -- default to weekly
  END CASE;
  
  -- Create recurring appointments
  WHILE appointment_date <= p_end_date LOOP
    -- Check if slot is available
    IF NOT EXISTS (
      SELECT 1 FROM public.appointments
      WHERE clinician_id = p_clinician_id
      AND appointment_date = appointment_date
      AND appointment_time = p_appointment_time
      AND status != 'cancelled'
    ) THEN
      -- Create appointment
      INSERT INTO public.appointments (
        client_id,
        clinician_id,
        appointment_date,
        appointment_time,
        status,
        created_at
      ) VALUES (
        p_client_id,
        p_clinician_id,
        appointment_date,
        p_appointment_time,
        'scheduled',
        NOW()
      );
      
      appointment_count := appointment_count + 1;
    END IF;
    
    appointment_date := appointment_date + interval_step;
  END LOOP;
  
  RETURN appointment_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_clinician() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_client() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_clinician_availability(uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_recurring_appointments(uuid, uuid, date, date, time, text) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_clinician() IS 'Security-hardened function to check if current user is a clinician';
COMMENT ON FUNCTION public.is_client() IS 'Security-hardened function to check if current user is a client';
COMMENT ON FUNCTION public.is_admin() IS 'Security-hardened function to check if current user is an admin';
COMMENT ON FUNCTION public.get_user_role() IS 'Security-hardened function to get current user role';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Security-hardened trigger function to update updated_at timestamp';
COMMENT ON FUNCTION public.generate_invoice_number() IS 'Security-hardened function to generate unique invoice numbers';
COMMENT ON FUNCTION public.get_clinician_availability(uuid, date, date) IS 'Security-hardened function to get clinician availability';
COMMENT ON FUNCTION public.trigger_schema_refresh() IS 'Security-hardened function for schema refresh operations';
COMMENT ON FUNCTION public.create_recurring_appointments(uuid, uuid, date, date, time, text) IS 'Security-hardened function to create recurring appointments';