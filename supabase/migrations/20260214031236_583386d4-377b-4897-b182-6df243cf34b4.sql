
-- Update the handle_new_user trigger to link to existing profiles by edu_email
-- instead of always creating a new profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_profile_id uuid;
BEGIN
  -- Check if a profile already exists with this edu_email (admin pre-created)
  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE edu_email = NEW.email;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Link the existing profile to this auth user
    UPDATE public.profiles
    SET user_id = NEW.id,
        full_name = COALESCE(full_name, NEW.raw_user_meta_data->>'full_name'),
        updated_at = now()
    WHERE id = existing_profile_id;
  END IF;
  -- If no matching profile, do NOT create one (unregistered user)
  
  -- Only assign student role if profile was found
  IF existing_profile_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;
