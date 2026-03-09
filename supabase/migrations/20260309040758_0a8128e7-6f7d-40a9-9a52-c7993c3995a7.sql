
-- Create certification status enum
CREATE TYPE public.certification_status AS ENUM ('draft', 'issued', 'revoked');

-- Create certifications table
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  score_snapshot integer NOT NULL DEFAULT 0,
  proficiency_level public.proficiency_level NOT NULL DEFAULT 'beginner',
  certificate_number text NOT NULL,
  issued_by uuid REFERENCES public.profiles(id),
  issued_at timestamp with time zone DEFAULT now(),
  valid_year integer NOT NULL,
  notes text,
  status public.certification_status NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT certifications_unique_student_sport_year UNIQUE (student_id, sport_id, valid_year)
);

-- Enable RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins manage certifications" ON public.certifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read issued certifications" ON public.certifications FOR SELECT USING (status = 'issued'::certification_status);
CREATE POLICY "Students read own certifications" ON public.certifications FOR SELECT USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number(p_year integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_seq int;
BEGIN
  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(certificate_number, '^AJS-SP-\d{4}-', ''), '')::int
  ), 0) + 1 INTO v_seq
  FROM certifications
  WHERE valid_year = p_year;

  RETURN 'AJS-SP-' || p_year::text || '-' || LPAD(v_seq::text, 4, '0');
END;
$$;
