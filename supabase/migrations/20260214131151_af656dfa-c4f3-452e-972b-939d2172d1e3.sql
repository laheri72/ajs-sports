
-- Fix 1: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users read profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix 2: Restrict sport_self_assessments to authenticated users only
DROP POLICY IF EXISTS "Anyone can read assessments" ON public.sport_self_assessments;
CREATE POLICY "Authenticated users read assessments"
  ON public.sport_self_assessments FOR SELECT
  USING (auth.uid() IS NOT NULL);
