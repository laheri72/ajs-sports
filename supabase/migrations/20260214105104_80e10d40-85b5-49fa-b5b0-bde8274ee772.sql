-- Add is_final and is_locked columns to student_selections
ALTER TABLE public.student_selections
ADD COLUMN is_final boolean NOT NULL DEFAULT false,
ADD COLUMN is_locked boolean NOT NULL DEFAULT false;

-- Allow captains to delete their own house selections (for re-drafting)
CREATE POLICY "Captains delete own house selections"
ON public.student_selections
FOR DELETE
USING (
  (has_role(auth.uid(), 'captain'::app_role) OR has_role(auth.uid(), 'co_captain'::app_role))
  AND house_id IN (SELECT p.house_id FROM profiles p WHERE p.user_id = auth.uid())
);