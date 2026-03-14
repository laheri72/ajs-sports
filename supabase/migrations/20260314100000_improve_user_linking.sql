
-- Improve handle_new_user trigger to be more robust with email matching
-- This ensures that manually added profiles with slightly different email casing/spacing still link correctly.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tr_number BIGINT;
BEGIN
  -- Try to find an existing profile by edu_email (case-insensitive and trimmed)
  SELECT tr_number INTO v_tr_number 
  FROM public.profiles 
  WHERE LOWER(TRIM(edu_email)) = LOWER(TRIM(NEW.email));

  IF v_tr_number IS NOT NULL THEN
    -- Update existing profile with user_id
    UPDATE public.profiles 
    SET user_id = NEW.id,
        updated_at = NOW()
    WHERE tr_number = v_tr_number;
    
    -- Ensure student role exists for this tr_number
    INSERT INTO public.user_roles (student_tr, role)
    VALUES (v_tr_number, 'student')
    ON CONFLICT (student_tr, role) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger is correctly attached (in case it was dropped or needs re-creation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
