
-- Proficiency level enum
CREATE TYPE public.proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Student sport proficiency table
CREATE TABLE public.student_sport_proficiencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  level proficiency_level NOT NULL DEFAULT 'beginner',
  source TEXT NOT NULL DEFAULT 'self' CHECK (source IN ('self', 'admin', 'computed')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (student_id, sport_id)
);

ALTER TABLE public.student_sport_proficiencies ENABLE ROW LEVEL SECURITY;

-- Anyone can read proficiencies
CREATE POLICY "Anyone can read proficiencies"
ON public.student_sport_proficiencies FOR SELECT
USING (true);

-- Students can upsert their own proficiency
CREATE POLICY "Students manage own proficiency"
ON public.student_sport_proficiencies FOR INSERT
WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students update own proficiency"
ON public.student_sport_proficiencies FOR UPDATE
USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admins full access
CREATE POLICY "Admins manage proficiencies"
ON public.student_sport_proficiencies FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Coaches full access
CREATE POLICY "Coaches manage proficiencies"
ON public.student_sport_proficiencies FOR ALL
USING (has_role(auth.uid(), 'coach'));

-- Self-assessment responses table
CREATE TABLE public.sport_self_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  experience_level TEXT NOT NULL, -- e.g. 'never', '1-2 years', '3-5 years', '5+ years'
  skill_rating INTEGER NOT NULL CHECK (skill_rating >= 1 AND skill_rating <= 5),
  years_of_practice INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (student_id, sport_id)
);

ALTER TABLE public.sport_self_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assessments"
ON public.sport_self_assessments FOR SELECT
USING (true);

CREATE POLICY "Students manage own assessment"
ON public.sport_self_assessments FOR INSERT
WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students update own assessment"
ON public.sport_self_assessments FOR UPDATE
USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage assessments"
ON public.sport_self_assessments FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger to update proficiency timestamp
CREATE TRIGGER update_proficiency_updated_at
BEFORE UPDATE ON public.student_sport_proficiencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
