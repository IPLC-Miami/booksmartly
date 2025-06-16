CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role'
    FROM auth.users
    WHERE id = user_id
  );
END;
$$;

ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Receptionist can read own profile"
  ON public.receptions FOR SELECT
  USING (
    auth.uid() = id
    OR
    public.get_user_role(auth.uid()) = 'admin'
  );

ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can list clinicians"
  ON public.clinicians FOR SELECT
  USING (auth.role() = 'authenticated');