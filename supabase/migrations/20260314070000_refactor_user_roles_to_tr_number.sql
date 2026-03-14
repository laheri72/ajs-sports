
-- Migration to refactor user_roles to use student_tr (tr_number) as the anchor instead of user_id.
-- This aligns with the "profiles as MASTER" strategy.
-- Updated dependency order.

-- 1. Add student_tr column to user_roles
ALTER TABLE public.user_roles ADD COLUMN student_tr BIGINT REFERENCES public.profiles(tr_number) ON DELETE CASCADE;

-- 2. Populate student_tr from existing profiles
UPDATE public.user_roles ur
SET student_tr = p.tr_number
FROM public.profiles p
WHERE ur.user_id = p.user_id;

-- 3. Delete any roles that couldn't be linked to a profile (if any)
DELETE FROM public.user_roles WHERE student_tr IS NULL;

-- 4. Drop policies that depend on user_id
DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;

-- 5. Make student_tr NOT NULL and drop user_id
ALTER TABLE public.user_roles ALTER COLUMN student_tr SET NOT NULL;
ALTER TABLE public.user_roles DROP COLUMN user_id;

-- 6. Update unique constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_student_tr_role_key UNIQUE (student_tr, role);

-- 6. Update has_role function to use profiles join
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

-- 7. Update RLS policies for user_roles
DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;

CREATE POLICY "Admins manage user_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    student_tr IN (SELECT tr_number FROM public.profiles WHERE user_id = auth.uid())
  );

-- 8. Update handle_new_user trigger to link by tr_number if possible
-- Note: This requires knowing the tr_number. If it's a new signup, we might need to match by email.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tr_number BIGINT;
BEGIN
  -- Try to find an existing profile by edu_email
  SELECT tr_number INTO v_tr_number FROM public.profiles WHERE edu_email = NEW.email;

  IF v_tr_number IS NOT NULL THEN
    -- Update existing profile with user_id
    UPDATE public.profiles SET user_id = NEW.id WHERE tr_number = v_tr_number;
  ELSE
    -- This case shouldn't happen much with pre-registration, but for safety:
    -- We can't insert a profile without a tr_number if it's the primary key.
    -- If tr_number is required, we might need a fallback or just fail.
    -- Assuming tr_number is NOT auto-generated based on the schema.
    RETURN NEW; 
  END IF;
  
  -- Ensure student role exists for this tr_number
  INSERT INTO public.user_roles (student_tr, role)
  VALUES (v_tr_number, 'student')
  ON CONFLICT (student_tr, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;
