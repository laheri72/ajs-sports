
-- Enums for talent identification
CREATE TYPE public.interest_level AS ENUM ('curious', 'beginner', 'learning', 'active', 'competitive');
CREATE TYPE public.confidence_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.interest_created_by AS ENUM ('student', 'admin', 'coach');

-- Sports interests table
CREATE TABLE public.sports_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  interest_level public.interest_level NOT NULL DEFAULT 'curious',
  confidence_level public.confidence_level NOT NULL DEFAULT 'low',
  created_by public.interest_created_by NOT NULL DEFAULT 'student',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, sport_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_sports_interests_updated_at
  BEFORE UPDATE ON public.sports_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.sports_interests ENABLE ROW LEVEL SECURITY;

-- Students can read their own interests
CREATE POLICY "Students read own interests"
  ON public.sports_interests FOR SELECT
  TO authenticated
  USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Students can insert their own interests
CREATE POLICY "Students insert own interests"
  ON public.sports_interests FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND created_by = 'student'
  );

-- Students can update their own interests
CREATE POLICY "Students update own interests"
  ON public.sports_interests FOR UPDATE
  TO authenticated
  USING (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Admins full access
CREATE POLICY "Admins manage sports_interests"
  ON public.sports_interests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Coaches can read all and create/update for students
CREATE POLICY "Coaches read all interests"
  ON public.sports_interests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches manage interests"
  ON public.sports_interests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sports_interests;
