
-- Enum for event participant status
CREATE TYPE public.club_event_participant_status AS ENUM ('registered', 'attended', 'absent');

-- Club event participants table
CREATE TABLE public.club_event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_event_id uuid NOT NULL REFERENCES public.club_events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status club_event_participant_status NOT NULL DEFAULT 'registered',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_event_id, student_id)
);

ALTER TABLE public.club_event_participants ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read participants
CREATE POLICY "Anyone can read club_event_participants"
  ON public.club_event_participants FOR SELECT
  TO authenticated USING (true);

-- RLS: Students register themselves
CREATE POLICY "Students register for club events"
  ON public.club_event_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND status = 'registered'
  );

-- RLS: Students can cancel own registration
CREATE POLICY "Students cancel own registration"
  ON public.club_event_participants FOR DELETE
  TO authenticated
  USING (
    student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND status = 'registered'
  );

-- RLS: Admins full access
CREATE POLICY "Admins manage club_event_participants"
  ON public.club_event_participants FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS: Coaches full access
CREATE POLICY "Coaches manage club_event_participants"
  ON public.club_event_participants FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'coach'));

-- RLS: Club incharge can update status (mark attendance)
CREATE POLICY "Incharge mark attendance"
  ON public.club_event_participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_events ce
      JOIN clubs c ON c.id = ce.club_id
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE ce.id = club_event_participants.club_event_id
        AND (c.incharge_id = p.id OR c.sub_incharge_id = p.id)
    )
  );

-- Trigger: auto-upgrade talent based on attendance milestones
CREATE OR REPLACE FUNCTION public.auto_interest_on_club_event_attendance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sport_id uuid;
  v_attended_count int;
  v_existing_rank int;
  v_existing_confidence text;
BEGIN
  -- Only fire when status changes to 'attended'
  IF NEW.status <> 'attended' THEN RETURN NEW; END IF;
  IF OLD IS NOT NULL AND OLD.status = 'attended' THEN RETURN NEW; END IF;

  -- Get sport_id from club_event → club
  SELECT c.sport_id INTO v_sport_id
  FROM club_events ce
  JOIN clubs c ON c.id = ce.club_id
  WHERE ce.id = NEW.club_event_id;

  IF v_sport_id IS NULL THEN RETURN NEW; END IF;

  -- Count total attended events for this student in this sport
  SELECT COUNT(*) INTO v_attended_count
  FROM club_event_participants cep
  JOIN club_events ce ON ce.id = cep.club_event_id
  JOIN clubs c ON c.id = ce.club_id
  WHERE cep.student_id = NEW.student_id
    AND cep.status = 'attended'
    AND c.sport_id = v_sport_id;

  -- Get existing interest
  SELECT 
    CASE interest_level
      WHEN 'curious' THEN 1 WHEN 'beginner' THEN 2 WHEN 'learning' THEN 3
      WHEN 'active' THEN 4 WHEN 'competitive' THEN 5 ELSE 0
    END,
    confidence_level::text
  INTO v_existing_rank, v_existing_confidence
  FROM sports_interests
  WHERE student_id = NEW.student_id AND sport_id = v_sport_id;

  -- 3+ events → confidence medium
  IF v_attended_count >= 3 THEN
    IF v_existing_rank IS NULL THEN
      INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
      VALUES (NEW.student_id, v_sport_id, 'learning', 'medium', 'admin');
    ELSIF v_existing_confidence = 'low' THEN
      UPDATE sports_interests
      SET confidence_level = 'medium', updated_at = now()
      WHERE student_id = NEW.student_id AND sport_id = v_sport_id;
    END IF;
  END IF;

  -- 10+ events → interest active
  IF v_attended_count >= 10 THEN
    IF v_existing_rank IS NOT NULL AND v_existing_rank < 4 THEN
      UPDATE sports_interests
      SET interest_level = 'active', updated_at = now()
      WHERE student_id = NEW.student_id AND sport_id = v_sport_id;
    ELSIF v_existing_rank IS NULL THEN
      INSERT INTO sports_interests (student_id, sport_id, interest_level, confidence_level, created_by)
      VALUES (NEW.student_id, v_sport_id, 'active', 'medium', 'admin')
      ON CONFLICT (student_id, sport_id) DO UPDATE
      SET interest_level = 'active', updated_at = now()
      WHERE sports_interests.interest_level IN ('curious','beginner','learning');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_interest_club_event_attendance
  AFTER INSERT OR UPDATE ON public.club_event_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_interest_on_club_event_attendance();
