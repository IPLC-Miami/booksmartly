-- Critical Security Fix: Enable RLS on tables with existing policies
-- This migration addresses the security vulnerabilities identified in the CSV audit
-- where RLS policies exist but RLS is not enabled on the tables

-- Enable RLS on all tables that have policies but RLS disabled
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campsxclinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcheckups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_reports ENABLE ROW LEVEL SECURITY;

-- Add comment for audit trail
COMMENT ON TABLE public.analytics_events IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.appointment_types IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.appointments IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.camps IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.campsxclinicians IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.clients IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.clinicians IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.feedback IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.healthcheckups IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.invoices IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.messages IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.prescriptions IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.profile_pictures IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.receptions IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.reminders IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';
COMMENT ON TABLE public.test_reports IS 'RLS enabled 2025-06-08 - Security fix for policy/RLS mismatch';