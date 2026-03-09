
-- 1. CRITICAL INDEXES for query performance

-- point_transactions indexes (leaderboard queries)
CREATE INDEX idx_point_transactions_season_house ON public.point_transactions(season_id, house_id);
CREATE INDEX idx_point_transactions_season_student ON public.point_transactions(season_id, student_id);
CREATE INDEX idx_point_transactions_event ON public.point_transactions(event_id);

-- matches indexes
CREATE INDEX idx_matches_season_event ON public.matches(season_id, event_id);

-- student_selections indexes
CREATE INDEX idx_student_selections_season_sport_cat ON public.student_selections(season_id, sport_id, category);
CREATE INDEX idx_student_selections_house ON public.student_selections(house_id);

-- participations indexes
CREATE INDEX idx_participations_event ON public.participations(event_id);
CREATE INDEX idx_participations_student ON public.participations(student_id);
CREATE INDEX idx_participations_season_event ON public.participations(season_id, event_id);

-- profiles indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_house ON public.profiles(house_id);

-- team_standings indexes
CREATE INDEX idx_team_standings_season_event ON public.team_standings(season_id, event_id);

-- 2. UNIQUE ACTIVE SEASON constraint (only one season can be active)
CREATE UNIQUE INDEX one_active_season ON public.seasons(is_active) WHERE is_active = true;

-- 3. POINT TRANSACTIONS duplicate prevention for placement points
CREATE UNIQUE INDEX idx_unique_placement_points ON public.point_transactions(event_id, house_id, source) WHERE source = 'placement';
