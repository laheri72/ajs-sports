
-- Enums for clubs
CREATE TYPE public.club_member_role AS ENUM ('member', 'incharge', 'sub_incharge');
CREATE TYPE public.club_member_status AS ENUM ('active', 'inactive');
CREATE TYPE public.club_event_type AS ENUM ('practice', 'friendly_match', 'training', 'open_game');

-- Clubs table
CREATE TABLE public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  incharge_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sub_incharge_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Club members table
CREATE TABLE public.club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.club_member_role NOT NULL DEFAULT 'member',
  status public.club_member_status NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_id, student_id)
);

-- Club events table
CREATE TABLE public.club_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type public.club_event_type NOT NULL DEFAULT 'practice',
  event_date timestamptz,
  location text,
  max_participants integer,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS on clubs
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clubs"
  ON public.clubs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage clubs"
  ON public.clubs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches manage clubs"
  ON public.clubs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

-- RLS on club_members
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read club_members"
  ON public.club_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Students join clubs"
  ON public.club_members FOR INSERT TO authenticated
  WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND role = 'member'
  );

CREATE POLICY "Students leave clubs"
  ON public.club_members FOR DELETE TO authenticated
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins manage club_members"
  ON public.club_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches manage club_members"
  ON public.club_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

-- RLS on club_events
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read club_events"
  ON public.club_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage club_events"
  ON public.club_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches manage club_events"
  ON public.club_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coach'));

-- Talent integration trigger: joining a club upgrades interest to 'learning'
CREATE OR REPLACE FUNCTION public.auto_interest_on_club_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sport_id uuid;
  v_existing_rank int;
BEGIN
  -- Get sport_id from the club
  SELECT c.sport_id INTO v_sport_id
  FROM clubs c WHERE c.id = NEW.club_id;

  IF v_sport_id IS NULL THEN RETURN NEW; END IF;

  -- Check existing interest
  SELECT CASE interest_level
    WHEN 'curious' THEN 1
    WHEN 'beginner' THEN 2
    WHEN 'learning' THEN 3
    WHEN 'active' THEN 4
    WHEN 'competitive' THEN 5
    ELSE 0
  END INTO v_existing_rank
  FROM sports_interests
  WHERE student_id = NEW.student_id AND sport_id = v_sport_id;

  IF v_existing_rank IS NULL THEN
    -- Create new interest at 'learning'
    INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
    VALUES (NEW.student_id, v_sport_id, 'learning', 'medium', 'admin');
  ELSIF v_existing_rank < 3 THEN
    -- Upgrade to learning, also bump confidence if low
    UPDATE sports_interests
    SET interest_level = 'learning',
        confidence_level = CASE WHEN confidence_level = 'low' THEN 'medium'::confidence_level ELSE confidence_level END,
        updated_at = now()
    WHERE student_id = NEW.student_id AND sport_id = v_sport_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_interest_club_join
  AFTER INSERT ON public.club_members
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_interest_on_club_join();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clubs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_events;
