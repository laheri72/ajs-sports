
-- ============================================================
-- MIGRATION 2: Foreign Keys, Indexes, Unique Constraints
-- ============================================================

-- === Foreign Keys for student_sport_scores ===
ALTER TABLE public.student_sport_scores
  ADD CONSTRAINT fk_student_sport_scores_student
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.student_sport_scores
  ADD CONSTRAINT fk_student_sport_scores_sport
    FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE RESTRICT;

-- === Fix certifications FK: sport should be RESTRICT, issued_by should SET NULL ===
ALTER TABLE public.certifications
  DROP CONSTRAINT IF EXISTS certifications_sport_id_fkey;

ALTER TABLE public.certifications
  ADD CONSTRAINT certifications_sport_id_fkey
    FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE RESTRICT;

ALTER TABLE public.certifications
  DROP CONSTRAINT IF EXISTS certifications_issued_by_fkey;

ALTER TABLE public.certifications
  ADD CONSTRAINT certifications_issued_by_fkey
    FOREIGN KEY (issued_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- === Unique Constraints ===
ALTER TABLE public.certifications
  ADD CONSTRAINT uniq_certificate_number UNIQUE (certificate_number);

-- student_sport_proficiencies unique (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uniq_student_sport_proficiency') THEN
    ALTER TABLE public.student_sport_proficiencies
      ADD CONSTRAINT uniq_student_sport_proficiency UNIQUE (student_id, sport_id);
  END IF;
END $$;

-- === Performance Indexes ===
CREATE INDEX IF NOT EXISTS idx_student_sport_scores_student ON public.student_sport_scores (student_id);
CREATE INDEX IF NOT EXISTS idx_student_sport_scores_sport ON public.student_sport_scores (sport_id);
CREATE INDEX IF NOT EXISTS idx_student_sport_scores_total_desc ON public.student_sport_scores (total_score DESC);

CREATE INDEX IF NOT EXISTS idx_club_event_participants_student ON public.club_event_participants (student_id);
CREATE INDEX IF NOT EXISTS idx_club_event_participants_event ON public.club_event_participants (club_event_id);

CREATE INDEX IF NOT EXISTS idx_match_request_players_student ON public.match_request_players (student_id);
CREATE INDEX IF NOT EXISTS idx_match_request_players_request ON public.match_request_players (request_id);

CREATE INDEX IF NOT EXISTS idx_club_members_student ON public.club_members (student_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON public.club_members (club_id);

CREATE INDEX IF NOT EXISTS idx_fitness_logs_student ON public.fitness_logs (student_id);

CREATE INDEX IF NOT EXISTS idx_sports_interests_student_sport ON public.sports_interests (student_id, sport_id);

CREATE INDEX IF NOT EXISTS idx_match_requests_sport ON public.match_requests (sport_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_created_by ON public.match_requests (created_by);

CREATE INDEX IF NOT EXISTS idx_club_events_club ON public.club_events (club_id);

CREATE INDEX IF NOT EXISTS idx_results_event ON public.results (event_id);
CREATE INDEX IF NOT EXISTS idx_results_participation ON public.results (participation_id);

CREATE INDEX IF NOT EXISTS idx_participations_student ON public.participations (student_id);
CREATE INDEX IF NOT EXISTS idx_participations_event ON public.participations (event_id);

CREATE INDEX IF NOT EXISTS idx_certifications_student ON public.certifications (student_id);
CREATE INDEX IF NOT EXISTS idx_certifications_sport ON public.certifications (sport_id);
CREATE INDEX IF NOT EXISTS idx_certifications_year ON public.certifications (valid_year);

CREATE INDEX IF NOT EXISTS idx_point_transactions_season_house ON public.point_transactions (season_id, house_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_student ON public.point_transactions (student_id);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_house_id ON public.profiles (house_id);
