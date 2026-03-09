
-- Add 'master' to proficiency_level enum
ALTER TYPE public.proficiency_level ADD VALUE IF NOT EXISTS 'master';

-- Student sport scores table
CREATE TABLE public.student_sport_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  competition_score int NOT NULL DEFAULT 0,
  club_score int NOT NULL DEFAULT 0,
  activity_score int NOT NULL DEFAULT 0,
  fitness_score int NOT NULL DEFAULT 0,
  total_score int NOT NULL DEFAULT 0,
  proficiency_level proficiency_level NOT NULL DEFAULT 'beginner',
  last_calculated timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, sport_id)
);

ALTER TABLE public.student_sport_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read student_sport_scores"
  ON public.student_sport_scores FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage student_sport_scores"
  ON public.student_sport_scores FOR ALL
  TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches manage student_sport_scores"
  ON public.student_sport_scores FOR ALL
  TO authenticated USING (has_role(auth.uid(), 'coach'));

-- Database function for score calculation (called by edge function or directly)
CREATE OR REPLACE FUNCTION public.calculate_student_sport_score(
  p_student_id uuid,
  p_sport_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_comp_score int := 0;
  v_club_score int := 0;
  v_activity_score int := 0;
  v_fitness_score int := 0;
  v_total int;
  v_level proficiency_level;
BEGIN
  -- 1. Competition score: placements + participation
  SELECT COALESCE(SUM(
    CASE 
      WHEN r.placement = 1 THEN 20
      WHEN r.placement = 2 THEN 15
      WHEN r.placement = 3 THEN 10
      ELSE 0
    END
  ), 0) INTO v_comp_score
  FROM results r
  JOIN participations p ON p.id = r.participation_id
  JOIN events e ON e.id = r.event_id
  WHERE p.student_id = p_student_id AND e.sport_id = p_sport_id;

  -- Add participation points (+3 each)
  v_comp_score := v_comp_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM participations p
    JOIN events e ON e.id = p.event_id
    WHERE p.student_id = p_student_id AND e.sport_id = p_sport_id
  ), 0);

  -- 2. Club score: attended events (+2), hosted events (+3)
  v_club_score := COALESCE((
    SELECT COUNT(*) * 2
    FROM club_event_participants cep
    JOIN club_events ce ON ce.id = cep.club_event_id
    JOIN clubs c ON c.id = ce.club_id
    WHERE cep.student_id = p_student_id 
      AND c.sport_id = p_sport_id 
      AND cep.status = 'attended'
  ), 0);

  -- Bonus for 10+ attendance
  IF v_club_score >= 20 THEN -- 10+ events * 2 = 20+
    v_club_score := v_club_score + 5;
  END IF;

  -- Club events created by this student (+3 each)
  v_club_score := v_club_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM club_events ce
    JOIN clubs c ON c.id = ce.club_id
    WHERE ce.created_by = p_student_id AND c.sport_id = p_sport_id
  ), 0);

  -- 3. Activity score: match_request participation (+2), created (+3)
  v_activity_score := COALESCE((
    SELECT COUNT(*) * 2
    FROM match_request_players mrp
    JOIN match_requests mr ON mr.id = mrp.request_id
    WHERE mrp.student_id = p_student_id AND mr.sport_id = p_sport_id
  ), 0);

  v_activity_score := v_activity_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM match_requests mr
    WHERE mr.created_by = p_student_id AND mr.sport_id = p_sport_id
  ), 0);

  -- 4. Fitness score: based on log count
  v_fitness_score := COALESCE((
    SELECT LEAST(COUNT(*) * 2, 15)
    FROM fitness_logs
    WHERE student_id = p_student_id
  ), 0);

  -- Total capped at 100
  v_total := LEAST(v_comp_score + v_club_score + v_activity_score + v_fitness_score, 100);

  -- Map to level
  v_level := CASE
    WHEN v_total >= 81 THEN 'master'
    WHEN v_total >= 61 THEN 'expert'
    WHEN v_total >= 41 THEN 'advanced'
    WHEN v_total >= 21 THEN 'intermediate'
    ELSE 'beginner'
  END;

  -- Upsert
  INSERT INTO student_sport_scores (student_id, sport_id, competition_score, club_score, activity_score, fitness_score, total_score, proficiency_level, last_calculated)
  VALUES (p_student_id, p_sport_id, LEAST(v_comp_score, 100), LEAST(v_club_score, 100), LEAST(v_activity_score, 100), LEAST(v_fitness_score, 100), v_total, v_level, now())
  ON CONFLICT (student_id, sport_id)
  DO UPDATE SET
    competition_score = LEAST(v_comp_score, 100),
    club_score = LEAST(v_club_score, 100),
    activity_score = LEAST(v_activity_score, 100),
    fitness_score = LEAST(v_fitness_score, 100),
    total_score = v_total,
    proficiency_level = v_level,
    last_calculated = now();
END;
$$;

-- Function to recalculate ALL scores
CREATE OR REPLACE FUNCTION public.recalculate_all_sport_scores()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec RECORD;
  v_count int := 0;
BEGIN
  -- Find all unique student-sport combinations across all activity tables
  FOR rec IN
    SELECT DISTINCT student_id, sport_id FROM (
      -- From participations
      SELECT p.student_id, e.sport_id
      FROM participations p JOIN events e ON e.id = p.event_id
      WHERE p.student_id IS NOT NULL
      UNION
      -- From club members
      SELECT cm.student_id, c.sport_id
      FROM club_members cm JOIN clubs c ON c.id = cm.club_id
      UNION
      -- From match request players
      SELECT mrp.student_id, mr.sport_id
      FROM match_request_players mrp JOIN match_requests mr ON mr.id = mrp.request_id
      UNION
      -- From sports interests
      SELECT si.student_id, si.sport_id
      FROM sports_interests si
    ) all_combos
  LOOP
    PERFORM calculate_student_sport_score(rec.student_id, rec.sport_id);
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;
