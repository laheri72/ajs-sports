
-- Final migration to move ALL student/user references to student_tr (TR Number)
-- This ensures the system is fully decoupled from auth.users (UUID) except for the initial profile link.

-- 1. student_selections: Fix created_by and student_tr
-- Note: based on error "invalid input syntax for type uuid", these might still be uuid in DB.

-- First, handle created_by
ALTER TABLE public.student_selections ADD COLUMN created_by_new BIGINT;
-- Try to map old UUIDs to TR numbers via profiles
UPDATE public.student_selections ss 
SET created_by_new = p.tr_number 
FROM public.profiles p 
WHERE ss.created_by::text = p.user_id::text;

ALTER TABLE public.student_selections DROP COLUMN created_by;
ALTER TABLE public.student_selections RENAME COLUMN created_by_new TO created_by;
ALTER TABLE public.student_selections ADD CONSTRAINT student_selections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(tr_number);

-- Ensure student_tr is bigint (it might already be, but let's be safe)
-- If it was renamed from student_id and is still uuid, this will fix it.
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_selections' AND column_name = 'student_tr' AND data_type = 'uuid') THEN
    ALTER TABLE public.student_selections RENAME COLUMN student_tr TO student_tr_old;
    ALTER TABLE public.student_selections ADD COLUMN student_tr BIGINT;
    UPDATE public.student_selections ss SET student_tr = p.tr_number FROM public.profiles p WHERE ss.student_tr_old::text = p.user_id::text;
    ALTER TABLE public.student_selections DROP COLUMN student_tr_old;
    ALTER TABLE public.student_selections ALTER COLUMN student_tr SET NOT NULL;
  END IF;
END $$;

-- 2. club_members: student_id -> student_tr
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'club_members' AND column_name = 'student_id') THEN
    ALTER TABLE public.club_members ADD COLUMN student_tr_new BIGINT REFERENCES public.profiles(tr_number) ON DELETE CASCADE;
    UPDATE public.club_members cm SET student_tr_new = p.tr_number FROM public.profiles p WHERE cm.student_id::text = p.user_id::text OR cm.student_id::text = p.tr_number::text;
    ALTER TABLE public.club_members DROP COLUMN student_id;
    ALTER TABLE public.club_members RENAME COLUMN student_tr_new TO student_tr;
    ALTER TABLE public.club_members ADD CONSTRAINT club_members_club_id_student_tr_key UNIQUE (club_id, student_tr);
  END IF;
END $$;

-- 3. club_events: created_by
ALTER TABLE public.club_events ADD COLUMN created_by_new BIGINT REFERENCES public.profiles(tr_number);
UPDATE public.club_events ce SET created_by_new = p.tr_number FROM public.profiles p WHERE ce.created_by::text = p.user_id::text;
ALTER TABLE public.club_events DROP COLUMN created_by;
ALTER TABLE public.club_events RENAME COLUMN created_by_new TO created_by;

-- 4. club_event_participants: student_id -> student_tr
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'club_event_participants' AND column_name = 'student_id') THEN
    ALTER TABLE public.club_event_participants ADD COLUMN student_tr_new BIGINT REFERENCES public.profiles(tr_number) ON DELETE CASCADE;
    UPDATE public.club_event_participants cep SET student_tr_new = p.tr_number FROM public.profiles p WHERE cep.student_id::text = p.user_id::text;
    ALTER TABLE public.club_event_participants DROP COLUMN student_id;
    ALTER TABLE public.club_event_participants RENAME COLUMN student_tr_new TO student_tr;
    ALTER TABLE public.club_event_participants ADD CONSTRAINT club_event_participants_event_student_key UNIQUE (club_event_id, student_tr);
  END IF;
END $$;

-- 5. match_request_players: student_id -> student_tr
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_request_players' AND column_name = 'student_id') THEN
    ALTER TABLE public.match_request_players ADD COLUMN student_tr_new BIGINT REFERENCES public.profiles(tr_number) ON DELETE CASCADE;
    UPDATE public.match_request_players mrp SET student_tr_new = p.tr_number FROM public.profiles p WHERE mrp.student_id::text = p.user_id::text;
    ALTER TABLE public.match_request_players DROP COLUMN student_id;
    ALTER TABLE public.match_request_players RENAME COLUMN student_tr_new TO student_tr;
    ALTER TABLE public.match_request_players ADD CONSTRAINT match_request_players_request_student_key UNIQUE (request_id, student_tr);
  END IF;
END $$;

-- 6. Update has_role function to be more efficient
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.tr_number = ur.student_tr
    WHERE p.user_id = _user_id AND ur.role = _role
  )
$$;

-- 7. Update recalculate_all_sport_scores to use new schema
CREATE OR REPLACE FUNCTION public.recalculate_all_sport_scores()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  v_count int := 0;
BEGIN
  FOR rec IN
    SELECT DISTINCT student_tr, sport_id FROM (
      SELECT student_tr, e.sport_id FROM participations p JOIN events e ON e.id = p.event_id
      UNION
      SELECT student_tr, c.sport_id FROM club_members cm JOIN clubs c ON c.id = cm.club_id
      UNION
      SELECT student_tr, mr.sport_id FROM match_request_players mrp JOIN match_requests mr ON mr.id = mrp.request_id
      UNION
      SELECT student_tr, sport_id FROM sports_interests
    ) all_combos
  LOOP
    PERFORM calculate_student_sport_score(rec.student_tr, rec.sport_id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;
