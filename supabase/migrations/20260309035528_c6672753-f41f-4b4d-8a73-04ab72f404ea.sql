
-- Enum for match request status
CREATE TYPE public.match_request_status AS ENUM ('open', 'full', 'completed');

-- Match requests table
CREATE TABLE public.match_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date timestamptz,
  location text,
  max_players int NOT NULL DEFAULT 10,
  status match_request_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- Match request players table
CREATE TABLE public.match_request_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id, student_id)
);

ALTER TABLE public.match_request_players ENABLE ROW LEVEL SECURITY;

-- RLS: match_requests
CREATE POLICY "Authenticated read match_requests"
  ON public.match_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students create match_requests"
  ON public.match_requests FOR INSERT TO authenticated
  WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creators update own match_requests"
  ON public.match_requests FOR UPDATE TO authenticated
  USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creators delete own match_requests"
  ON public.match_requests FOR DELETE TO authenticated
  USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage match_requests"
  ON public.match_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS: match_request_players
CREATE POLICY "Authenticated read match_request_players"
  ON public.match_request_players FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students join match_requests"
  ON public.match_request_players FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students leave match_requests"
  ON public.match_request_players FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage match_request_players"
  ON public.match_request_players FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Trigger: auto-set status to 'full' when max_players reached
CREATE OR REPLACE FUNCTION public.auto_match_request_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count int;
  v_max int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM match_request_players WHERE request_id = NEW.request_id;

  SELECT max_players INTO v_max
  FROM match_requests WHERE id = NEW.request_id;

  IF v_count >= v_max THEN
    UPDATE match_requests SET status = 'full' WHERE id = NEW.request_id AND status = 'open';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_match_request_status
  AFTER INSERT ON public.match_request_players
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_match_request_status();

-- Trigger: re-open if player leaves and was full
CREATE OR REPLACE FUNCTION public.auto_match_request_reopen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count int;
  v_max int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM match_request_players WHERE request_id = OLD.request_id;

  SELECT max_players INTO v_max
  FROM match_requests WHERE id = OLD.request_id;

  IF v_count < v_max THEN
    UPDATE match_requests SET status = 'open' WHERE id = OLD.request_id AND status = 'full';
  END IF;

  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_auto_match_request_reopen
  AFTER DELETE ON public.match_request_players
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_match_request_reopen();

-- Trigger: talent integration - 5+ joins in a sport → active
CREATE OR REPLACE FUNCTION public.auto_interest_on_buddy_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sport_id uuid;
  v_join_count int;
  v_existing_rank int;
BEGIN
  SELECT mr.sport_id INTO v_sport_id
  FROM match_requests mr WHERE mr.id = NEW.request_id;

  IF v_sport_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_join_count
  FROM match_request_players mrp
  JOIN match_requests mr ON mr.id = mrp.request_id
  WHERE mrp.student_id = NEW.student_id AND mr.sport_id = v_sport_id;

  IF v_join_count >= 5 THEN
    SELECT CASE interest_level
      WHEN 'curious' THEN 1 WHEN 'beginner' THEN 2 WHEN 'learning' THEN 3
      WHEN 'active' THEN 4 WHEN 'competitive' THEN 5 ELSE 0
    END INTO v_existing_rank
    FROM sports_interests
    WHERE student_id = NEW.student_id AND sport_id = v_sport_id;

    IF v_existing_rank IS NULL THEN
      INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
      VALUES (NEW.student_id, v_sport_id, 'active', 'medium', 'admin');
    ELSIF v_existing_rank < 4 THEN
      UPDATE sports_interests
      SET interest_level = 'active', updated_at = now()
      WHERE student_id = NEW.student_id AND sport_id = v_sport_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_interest_buddy_match
  AFTER INSERT ON public.match_request_players
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_interest_on_buddy_match();
