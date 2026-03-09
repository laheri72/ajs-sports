
-- =============================================
-- FIX 1: REMOVE DUPLICATE TRIGGERS
-- Keep only the trg_auto_interest_on_* variants, drop the shorter-named duplicates
-- =============================================

DROP TRIGGER IF EXISTS trg_auto_interest_participation ON public.participations;
DROP TRIGGER IF EXISTS trg_auto_interest_result ON public.results;
DROP TRIGGER IF EXISTS trg_auto_interest_club_join ON public.club_members;
DROP TRIGGER IF EXISTS trg_auto_interest_club_event_attendance ON public.club_event_participants;
DROP TRIGGER IF EXISTS trg_auto_interest_buddy_match ON public.match_request_players;

-- Fix the club_event_participants trigger to fire on INSERT OR UPDATE (not just UPDATE)
DROP TRIGGER IF EXISTS trg_auto_interest_on_club_event_attendance ON public.club_event_participants;
CREATE TRIGGER trg_auto_interest_on_club_event_attendance
  AFTER INSERT OR UPDATE ON public.club_event_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_interest_on_club_event_attendance();

-- =============================================
-- FIX 2: REMOVE DUPLICATE FK CONSTRAINTS on student_sport_scores
-- =============================================

ALTER TABLE public.student_sport_scores
  DROP CONSTRAINT IF EXISTS student_sport_scores_sport_id_fkey;

ALTER TABLE public.student_sport_scores
  DROP CONSTRAINT IF EXISTS student_sport_scores_student_id_fkey;

-- =============================================
-- FIX 3: PROPER SCORING CAPS (60/25/20/15)
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_student_sport_score(p_student_id uuid, p_sport_id uuid)
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
  -- 1. Competition score: placements + participation (CAP: 60)
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

  v_comp_score := v_comp_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM participations p
    JOIN events e ON e.id = p.event_id
    WHERE p.student_id = p_student_id AND e.sport_id = p_sport_id
  ), 0);

  v_comp_score := LEAST(v_comp_score, 60);

  -- 2. Club score (CAP: 25)
  v_club_score := COALESCE((
    SELECT COUNT(*) * 2
    FROM club_event_participants cep
    JOIN club_events ce ON ce.id = cep.club_event_id
    JOIN clubs c ON c.id = ce.club_id
    WHERE cep.student_id = p_student_id 
      AND c.sport_id = p_sport_id 
      AND cep.status = 'attended'
  ), 0);

  IF v_club_score >= 20 THEN
    v_club_score := v_club_score + 5;
  END IF;

  v_club_score := v_club_score + COALESCE((
    SELECT COUNT(*) * 3
    FROM club_events ce
    JOIN clubs c ON c.id = ce.club_id
    WHERE ce.created_by = p_student_id AND c.sport_id = p_sport_id
  ), 0);

  v_club_score := LEAST(v_club_score, 25);

  -- 3. Activity score (CAP: 20)
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

  v_activity_score := LEAST(v_activity_score, 20);

  -- 4. Fitness score (CAP: 15)
  v_fitness_score := LEAST(COALESCE((
    SELECT COUNT(*) * 2
    FROM fitness_logs
    WHERE student_id = p_student_id
  ), 0), 15);

  -- Total (max theoretical: 120, capped at 100)
  v_total := LEAST(v_comp_score + v_club_score + v_activity_score + v_fitness_score, 100);

  v_level := CASE
    WHEN v_total >= 81 THEN 'master'
    WHEN v_total >= 61 THEN 'expert'
    WHEN v_total >= 41 THEN 'advanced'
    WHEN v_total >= 21 THEN 'intermediate'
    ELSE 'beginner'
  END;

  INSERT INTO student_sport_scores (student_id, sport_id, competition_score, club_score, activity_score, fitness_score, total_score, proficiency_level, last_calculated)
  VALUES (p_student_id, p_sport_id, v_comp_score, v_club_score, v_activity_score, v_fitness_score, v_total, v_level, now())
  ON CONFLICT (student_id, sport_id)
  DO UPDATE SET
    competition_score = v_comp_score,
    club_score = v_club_score,
    activity_score = v_activity_score,
    fitness_score = v_fitness_score,
    total_score = v_total,
    proficiency_level = v_level,
    last_calculated = now();
END;
$$;
