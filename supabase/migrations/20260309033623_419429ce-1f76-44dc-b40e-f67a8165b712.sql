
-- Add is_identified_talent column
ALTER TABLE public.sports_interests 
  ADD COLUMN IF NOT EXISTS is_identified_talent boolean NOT NULL DEFAULT false;

-- Function: auto-upsert interest when participation is created
-- Maps event → sport, then upserts interest to 'active'
CREATE OR REPLACE FUNCTION public.auto_interest_on_participation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sport_id uuid;
  v_interest_rank int;
  v_existing_rank int;
BEGIN
  -- Get sport_id from the event
  SELECT e.sport_id INTO v_sport_id
  FROM events e WHERE e.id = NEW.event_id;
  
  IF v_sport_id IS NULL OR NEW.student_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Interest level ranking: curious=1, beginner=2, learning=3, active=4, competitive=5
  v_interest_rank := 4; -- 'active'

  -- Check existing interest level
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
    -- No record exists, create one
    INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
    VALUES (NEW.student_id, v_sport_id, 'active', 'medium', 'admin');
  ELSIF v_existing_rank < v_interest_rank THEN
    -- Upgrade only if current level is lower
    UPDATE sports_interests
    SET interest_level = 'active', updated_at = now()
    WHERE student_id = NEW.student_id AND sport_id = v_sport_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Function: auto-upgrade interest to 'competitive' when result is recorded
CREATE OR REPLACE FUNCTION public.auto_interest_on_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sport_id uuid;
  v_student_id uuid;
  v_existing_rank int;
BEGIN
  -- Get student_id and sport_id from participation → event
  SELECT p.student_id, e.sport_id INTO v_student_id, v_sport_id
  FROM participations p
  JOIN events e ON e.id = p.event_id
  WHERE p.id = NEW.participation_id;

  IF v_sport_id IS NULL OR v_student_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT CASE interest_level
    WHEN 'curious' THEN 1
    WHEN 'beginner' THEN 2
    WHEN 'learning' THEN 3
    WHEN 'active' THEN 4
    WHEN 'competitive' THEN 5
    ELSE 0
  END INTO v_existing_rank
  FROM sports_interests
  WHERE student_id = v_student_id AND sport_id = v_sport_id;

  IF v_existing_rank IS NULL THEN
    INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
    VALUES (v_student_id, v_sport_id, 'competitive', 'high', 'admin');
  ELSIF v_existing_rank < 5 THEN
    UPDATE sports_interests
    SET interest_level = 'competitive', confidence_level = 'high', updated_at = now()
    WHERE student_id = v_student_id AND sport_id = v_sport_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER trg_auto_interest_participation
  AFTER INSERT ON public.participations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_interest_on_participation();

CREATE TRIGGER trg_auto_interest_result
  AFTER INSERT ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_interest_on_result();
