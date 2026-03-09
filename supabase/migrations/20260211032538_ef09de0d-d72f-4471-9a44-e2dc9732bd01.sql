
-- Add new student fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS its_number text,
  ADD COLUMN IF NOT EXISTS darajah text,
  ADD COLUMN IF NOT EXISTS class_name text,
  ADD COLUMN IF NOT EXISTS edu_email text,
  ADD COLUMN IF NOT EXISTS is_under_18 boolean DEFAULT false;

-- Add unique constraint on edu_email
ALTER TABLE public.profiles ADD CONSTRAINT profiles_edu_email_unique UNIQUE (edu_email);

-- Add unique constraint on its_number
ALTER TABLE public.profiles ADD CONSTRAINT profiles_its_number_unique UNIQUE (its_number);

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Admins can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (for managing students)
CREATE POLICY "Admins manage profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
