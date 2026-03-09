
-- Admin full access
CREATE POLICY "Admins full access student_selections"
ON public.student_selections
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Captain SELECT own house
CREATE POLICY "Captains select own house selections"
ON public.student_selections
FOR SELECT
USING (
  (has_role(auth.uid(), 'captain') OR has_role(auth.uid(), 'co_captain'))
  AND house_id IN (SELECT p.house_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- Captain INSERT own house
CREATE POLICY "Captains insert own house selections"
ON public.student_selections
FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'captain') OR has_role(auth.uid(), 'co_captain'))
  AND house_id IN (SELECT p.house_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- Captain UPDATE own house
CREATE POLICY "Captains update own house selections"
ON public.student_selections
FOR UPDATE
USING (
  (has_role(auth.uid(), 'captain') OR has_role(auth.uid(), 'co_captain'))
  AND house_id IN (SELECT p.house_id FROM public.profiles p WHERE p.user_id = auth.uid())
);
