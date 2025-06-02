-- Create a simple function to trigger schema refresh
CREATE OR REPLACE FUNCTION trigger_schema_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function will trigger PostgREST to reload its schema cache
  -- by performing a NOTIFY operation
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION trigger_schema_refresh() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_schema_refresh() TO service_role;