-- Add foreign key constraint from campsxclinicians.camp_id to camps.id
-- Ensure this runs after both tables (camps and campsxclinicians) have been created.

-- Drop constraint if it somehow exists from a previous attempt, to make this idempotent
ALTER TABLE IF EXISTS public.campsxclinicians
DROP CONSTRAINT IF EXISTS fk_campsxclinicians_camp_id;

ALTER TABLE public.campsxclinicians
ADD CONSTRAINT fk_campsxclinicians_camp_id
FOREIGN KEY (camp_id) REFERENCES public.camps(id) ON DELETE CASCADE;

COMMENT ON CONSTRAINT fk_campsxclinicians_camp_id ON public.campsxclinicians IS 'Ensures camp_id in campsxclinicians refers to a valid camp in the camps table.';