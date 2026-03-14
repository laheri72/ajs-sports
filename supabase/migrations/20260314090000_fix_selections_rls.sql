
-- Migration to fix RLS policies for student_selections
-- This ensures admins and captains can save drafts and manage selections.

-- 1. Ensure RLS is enabled
ALTER TABLE public.student_selections ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins full access student_selections" ON public.student_selections;
DROP POLICY IF EXISTS "Admins manage all selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains manage own house selections" ON public.student_selections;
DROP POLICY IF EXISTS "Anyone can read selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains select own house selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains insert own house selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains update own house selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains delete own house selections" ON public.student_selections;

-- 3. Admin Policy: Full access to all selections
CREATE POLICY "Admins manage all selections"
ON public.student_selections
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Captain Policy: Manage selections for their own house only
CREATE POLICY "Captains manage own house selections"
ON public.student_selections
FOR ALL
TO authenticated
USING (
  (public.has_role(auth.uid(), 'captain'::app_role) OR public.has_role(auth.uid(), 'co_captain'::app_role))
  AND house_id IN (SELECT house_id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  (public.has_role(auth.uid(), 'captain'::app_role) OR public.has_role(auth.uid(), 'co_captain'::app_role))
  AND house_id IN (SELECT house_id FROM public.profiles WHERE user_id = auth.uid())
);

-- 5. Read Access: All authenticated users can view selections
-- (Needed for summary views and cross-house comparisons)
CREATE POLICY "Anyone can read selections"
ON public.student_selections
FOR SELECT
TO authenticated
USING (true);

-- 6. Fix for potential recursion in has_role
-- Ensure the function is as efficient as possible
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.tr_number = ur.student_tr
    WHERE p.user_id = _user_id AND ur.role = _role
  )
$$;
