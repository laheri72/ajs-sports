
-- ============================================================
-- MIGRATION 1: Fix ALL RLS policies from RESTRICTIVE to PERMISSIVE
-- ============================================================

-- ==================== student_sport_scores ====================
DROP POLICY IF EXISTS "Admins manage student_sport_scores" ON public.student_sport_scores;
DROP POLICY IF EXISTS "Anyone can read student_sport_scores" ON public.student_sport_scores;
DROP POLICY IF EXISTS "Coaches manage student_sport_scores" ON public.student_sport_scores;

CREATE POLICY "Admins manage student_sport_scores" ON public.student_sport_scores
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage student_sport_scores" ON public.student_sport_scores
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read student_sport_scores" ON public.student_sport_scores
  FOR SELECT TO authenticated USING (true);

-- ==================== sports_interests ====================
DROP POLICY IF EXISTS "Admins manage sports_interests" ON public.sports_interests;
DROP POLICY IF EXISTS "Coaches manage interests" ON public.sports_interests;
DROP POLICY IF EXISTS "Coaches read all interests" ON public.sports_interests;
DROP POLICY IF EXISTS "Students insert own interests" ON public.sports_interests;
DROP POLICY IF EXISTS "Students read own interests" ON public.sports_interests;
DROP POLICY IF EXISTS "Students update own interests" ON public.sports_interests;

CREATE POLICY "Admins manage sports_interests" ON public.sports_interests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage sports_interests" ON public.sports_interests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Students read own interests" ON public.sports_interests
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students insert own interests" ON public.sports_interests
  FOR INSERT TO authenticated
  WITH CHECK ((student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) AND (created_by = 'student'::interest_created_by));

CREATE POLICY "Students update own interests" ON public.sports_interests
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== seasons ====================
DROP POLICY IF EXISTS "Admins manage seasons" ON public.seasons;
DROP POLICY IF EXISTS "Anyone can read seasons" ON public.seasons;

CREATE POLICY "Admins manage seasons" ON public.seasons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read seasons" ON public.seasons
  FOR SELECT TO authenticated USING (true);

-- ==================== achievements ====================
DROP POLICY IF EXISTS "Admins manage achievements" ON public.achievements;
DROP POLICY IF EXISTS "Anyone can read achievements" ON public.achievements;

CREATE POLICY "Admins manage achievements" ON public.achievements
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read achievements" ON public.achievements
  FOR SELECT TO authenticated USING (true);

-- ==================== match_request_players ====================
DROP POLICY IF EXISTS "Admins manage match_request_players" ON public.match_request_players;
DROP POLICY IF EXISTS "Authenticated read match_request_players" ON public.match_request_players;
DROP POLICY IF EXISTS "Students join match_requests" ON public.match_request_players;
DROP POLICY IF EXISTS "Students leave match_requests" ON public.match_request_players;

CREATE POLICY "Admins manage match_request_players" ON public.match_request_players
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read match_request_players" ON public.match_request_players
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students join match_requests" ON public.match_request_players
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students leave match_requests" ON public.match_request_players
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== houses ====================
DROP POLICY IF EXISTS "Admins manage houses" ON public.houses;
DROP POLICY IF EXISTS "Anyone can read houses" ON public.houses;

CREATE POLICY "Admins manage houses" ON public.houses
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read houses" ON public.houses
  FOR SELECT TO authenticated USING (true);

-- ==================== student_sport_proficiencies ====================
DROP POLICY IF EXISTS "Admins manage proficiencies" ON public.student_sport_proficiencies;
DROP POLICY IF EXISTS "Anyone can read proficiencies" ON public.student_sport_proficiencies;
DROP POLICY IF EXISTS "Coaches manage proficiencies" ON public.student_sport_proficiencies;
DROP POLICY IF EXISTS "Students manage own proficiency" ON public.student_sport_proficiencies;
DROP POLICY IF EXISTS "Students update own proficiency" ON public.student_sport_proficiencies;

CREATE POLICY "Admins manage proficiencies" ON public.student_sport_proficiencies
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage proficiencies" ON public.student_sport_proficiencies
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read proficiencies" ON public.student_sport_proficiencies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students insert own proficiency" ON public.student_sport_proficiencies
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students update own proficiency" ON public.student_sport_proficiencies
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== team_standings ====================
DROP POLICY IF EXISTS "Admins manage team_standings" ON public.team_standings;
DROP POLICY IF EXISTS "Anyone can read team_standings" ON public.team_standings;
DROP POLICY IF EXISTS "Coaches manage team_standings" ON public.team_standings;

CREATE POLICY "Admins manage team_standings" ON public.team_standings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage team_standings" ON public.team_standings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read team_standings" ON public.team_standings
  FOR SELECT TO authenticated USING (true);

-- ==================== results ====================
DROP POLICY IF EXISTS "Admins manage results" ON public.results;
DROP POLICY IF EXISTS "Anyone can read results" ON public.results;
DROP POLICY IF EXISTS "Coaches manage results" ON public.results;

CREATE POLICY "Admins manage results" ON public.results
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage results" ON public.results
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read results" ON public.results
  FOR SELECT TO authenticated USING (true);

-- ==================== match_requests ====================
DROP POLICY IF EXISTS "Admins manage match_requests" ON public.match_requests;
DROP POLICY IF EXISTS "Authenticated read match_requests" ON public.match_requests;
DROP POLICY IF EXISTS "Creators delete own match_requests" ON public.match_requests;
DROP POLICY IF EXISTS "Creators update own match_requests" ON public.match_requests;
DROP POLICY IF EXISTS "Students create match_requests" ON public.match_requests;

CREATE POLICY "Admins manage match_requests" ON public.match_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read match_requests" ON public.match_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students create match_requests" ON public.match_requests
  FOR INSERT TO authenticated
  WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creators update own match_requests" ON public.match_requests
  FOR UPDATE TO authenticated
  USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creators delete own match_requests" ON public.match_requests
  FOR DELETE TO authenticated
  USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== participations ====================
DROP POLICY IF EXISTS "Admins manage participations" ON public.participations;
DROP POLICY IF EXISTS "Anyone can read participations" ON public.participations;
DROP POLICY IF EXISTS "Coaches manage participations" ON public.participations;
DROP POLICY IF EXISTS "Students register self" ON public.participations;

CREATE POLICY "Admins manage participations" ON public.participations
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage participations" ON public.participations
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read participations" ON public.participations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students register self" ON public.participations
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== student_selections ====================
DROP POLICY IF EXISTS "Admins full access student_selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains delete own house selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains insert own house selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains select own house selections" ON public.student_selections;
DROP POLICY IF EXISTS "Captains update own house selections" ON public.student_selections;

CREATE POLICY "Admins full access student_selections" ON public.student_selections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Captains select own house selections" ON public.student_selections
  FOR SELECT TO authenticated
  USING ((public.has_role(auth.uid(), 'captain'::app_role) OR public.has_role(auth.uid(), 'co_captain'::app_role))
    AND house_id IN (SELECT p.house_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Captains insert own house selections" ON public.student_selections
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(), 'captain'::app_role) OR public.has_role(auth.uid(), 'co_captain'::app_role))
    AND house_id IN (SELECT p.house_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Captains update own house selections" ON public.student_selections
  FOR UPDATE TO authenticated
  USING ((public.has_role(auth.uid(), 'captain'::app_role) OR public.has_role(auth.uid(), 'co_captain'::app_role))
    AND house_id IN (SELECT p.house_id FROM profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Captains delete own house selections" ON public.student_selections
  FOR DELETE TO authenticated
  USING ((public.has_role(auth.uid(), 'captain'::app_role) OR public.has_role(auth.uid(), 'co_captain'::app_role))
    AND house_id IN (SELECT p.house_id FROM profiles p WHERE p.user_id = auth.uid()));

-- ==================== hizb ====================
DROP POLICY IF EXISTS "Admins manage hizb" ON public.hizb;
DROP POLICY IF EXISTS "Anyone can read hizb" ON public.hizb;

CREATE POLICY "Admins manage hizb" ON public.hizb
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read hizb" ON public.hizb
  FOR SELECT TO authenticated USING (true);

-- ==================== fitness_logs ====================
DROP POLICY IF EXISTS "Admins manage fitness" ON public.fitness_logs;
DROP POLICY IF EXISTS "Coaches read all fitness" ON public.fitness_logs;
DROP POLICY IF EXISTS "Users insert own fitness" ON public.fitness_logs;
DROP POLICY IF EXISTS "Users read own fitness" ON public.fitness_logs;

CREATE POLICY "Admins manage fitness" ON public.fitness_logs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches read all fitness" ON public.fitness_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Users read own fitness" ON public.fitness_logs
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users insert own fitness" ON public.fitness_logs
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== certifications ====================
DROP POLICY IF EXISTS "Admins manage certifications" ON public.certifications;
DROP POLICY IF EXISTS "Anyone can read issued certifications" ON public.certifications;
DROP POLICY IF EXISTS "Students read own certifications" ON public.certifications;

CREATE POLICY "Admins manage certifications" ON public.certifications
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read issued certifications" ON public.certifications
  FOR SELECT TO authenticated USING (status = 'issued'::certification_status);

CREATE POLICY "Students read own certifications" ON public.certifications
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;

CREATE POLICY "Admins manage user_roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== trainings ====================
DROP POLICY IF EXISTS "Admins manage trainings" ON public.trainings;
DROP POLICY IF EXISTS "Anyone can read trainings" ON public.trainings;

CREATE POLICY "Admins manage trainings" ON public.trainings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read trainings" ON public.trainings
  FOR SELECT TO authenticated USING (true);

-- ==================== club_members ====================
DROP POLICY IF EXISTS "Admins manage club_members" ON public.club_members;
DROP POLICY IF EXISTS "Anyone can read club_members" ON public.club_members;
DROP POLICY IF EXISTS "Coaches manage club_members" ON public.club_members;
DROP POLICY IF EXISTS "Students join clubs" ON public.club_members;
DROP POLICY IF EXISTS "Students leave clubs" ON public.club_members;

CREATE POLICY "Admins manage club_members" ON public.club_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage club_members" ON public.club_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read club_members" ON public.club_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students join clubs" ON public.club_members
  FOR INSERT TO authenticated
  WITH CHECK ((student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) AND (role = 'member'::club_member_role));

CREATE POLICY "Students leave clubs" ON public.club_members
  FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== matches ====================
DROP POLICY IF EXISTS "Admins manage matches" ON public.matches;
DROP POLICY IF EXISTS "Anyone can read matches" ON public.matches;
DROP POLICY IF EXISTS "Coaches manage matches" ON public.matches;

CREATE POLICY "Admins manage matches" ON public.matches
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage matches" ON public.matches
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read matches" ON public.matches
  FOR SELECT TO authenticated USING (true);

-- ==================== wildcard_programs ====================
DROP POLICY IF EXISTS "Admins manage wildcard_programs" ON public.wildcard_programs;
DROP POLICY IF EXISTS "Anyone can read wildcard_programs" ON public.wildcard_programs;

CREATE POLICY "Admins manage wildcard_programs" ON public.wildcard_programs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read wildcard_programs" ON public.wildcard_programs
  FOR SELECT TO authenticated USING (true);

-- ==================== team_members ====================
DROP POLICY IF EXISTS "Admins manage team_members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone can read team_members" ON public.team_members;
DROP POLICY IF EXISTS "Coaches manage team_members" ON public.team_members;

CREATE POLICY "Admins manage team_members" ON public.team_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage team_members" ON public.team_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read team_members" ON public.team_members
  FOR SELECT TO authenticated USING (true);

-- ==================== sport_self_assessments ====================
DROP POLICY IF EXISTS "Admins manage assessments" ON public.sport_self_assessments;
DROP POLICY IF EXISTS "Authenticated users read assessments" ON public.sport_self_assessments;
DROP POLICY IF EXISTS "Students manage own assessment" ON public.sport_self_assessments;
DROP POLICY IF EXISTS "Students update own assessment" ON public.sport_self_assessments;

CREATE POLICY "Admins manage assessments" ON public.sport_self_assessments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users read assessments" ON public.sport_self_assessments
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Students insert own assessment" ON public.sport_self_assessments
  FOR INSERT TO authenticated
  WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students update own assessment" ON public.sport_self_assessments
  FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== events ====================
DROP POLICY IF EXISTS "Admins manage events" ON public.events;
DROP POLICY IF EXISTS "Anyone can read events" ON public.events;
DROP POLICY IF EXISTS "Coaches manage events" ON public.events;

CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage events" ON public.events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read events" ON public.events
  FOR SELECT TO authenticated USING (true);

-- ==================== point_transactions ====================
DROP POLICY IF EXISTS "Admins manage point_transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "Anyone can read point_transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "Coaches manage point_transactions" ON public.point_transactions;

CREATE POLICY "Admins manage point_transactions" ON public.point_transactions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage point_transactions" ON public.point_transactions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read point_transactions" ON public.point_transactions
  FOR SELECT TO authenticated USING (true);

-- ==================== club_events ====================
DROP POLICY IF EXISTS "Admins manage club_events" ON public.club_events;
DROP POLICY IF EXISTS "Anyone can read club_events" ON public.club_events;
DROP POLICY IF EXISTS "Coaches manage club_events" ON public.club_events;

CREATE POLICY "Admins manage club_events" ON public.club_events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage club_events" ON public.club_events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read club_events" ON public.club_events
  FOR SELECT TO authenticated USING (true);

-- ==================== sports ====================
DROP POLICY IF EXISTS "Admins manage sports" ON public.sports;
DROP POLICY IF EXISTS "Anyone can read sports" ON public.sports;

CREATE POLICY "Admins manage sports" ON public.sports
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read sports" ON public.sports
  FOR SELECT TO authenticated USING (true);

-- ==================== club_event_participants ====================
DROP POLICY IF EXISTS "Admins manage club_event_participants" ON public.club_event_participants;
DROP POLICY IF EXISTS "Anyone can read club_event_participants" ON public.club_event_participants;
DROP POLICY IF EXISTS "Coaches manage club_event_participants" ON public.club_event_participants;
DROP POLICY IF EXISTS "Incharge mark attendance" ON public.club_event_participants;
DROP POLICY IF EXISTS "Students cancel own registration" ON public.club_event_participants;
DROP POLICY IF EXISTS "Students register for club events" ON public.club_event_participants;

CREATE POLICY "Admins manage club_event_participants" ON public.club_event_participants
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage club_event_participants" ON public.club_event_participants
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read club_event_participants" ON public.club_event_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students register for club events" ON public.club_event_participants
  FOR INSERT TO authenticated
  WITH CHECK ((student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) AND (status = 'registered'::club_event_participant_status));

CREATE POLICY "Students cancel own registration" ON public.club_event_participants
  FOR DELETE TO authenticated
  USING ((student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) AND (status = 'registered'::club_event_participant_status));

CREATE POLICY "Incharge mark attendance" ON public.club_event_participants
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM club_events ce
    JOIN clubs c ON c.id = ce.club_id
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE ce.id = club_event_participants.club_event_id
    AND (c.incharge_id = p.id OR c.sub_incharge_id = p.id)
  ));

-- ==================== profiles ====================
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;

CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ==================== student_event_roles ====================
DROP POLICY IF EXISTS "Admins manage student_event_roles" ON public.student_event_roles;
DROP POLICY IF EXISTS "Anyone can read student_event_roles" ON public.student_event_roles;
DROP POLICY IF EXISTS "Coaches manage student_event_roles" ON public.student_event_roles;

CREATE POLICY "Admins manage student_event_roles" ON public.student_event_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage student_event_roles" ON public.student_event_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read student_event_roles" ON public.student_event_roles
  FOR SELECT TO authenticated USING (true);

-- ==================== clubs ====================
DROP POLICY IF EXISTS "Admins manage clubs" ON public.clubs;
DROP POLICY IF EXISTS "Anyone can read clubs" ON public.clubs;
DROP POLICY IF EXISTS "Coaches manage clubs" ON public.clubs;

CREATE POLICY "Admins manage clubs" ON public.clubs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage clubs" ON public.clubs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read clubs" ON public.clubs
  FOR SELECT TO authenticated USING (true);

-- ==================== training_attendance ====================
DROP POLICY IF EXISTS "Admins manage attendance" ON public.training_attendance;
DROP POLICY IF EXISTS "Coaches manage attendance" ON public.training_attendance;
DROP POLICY IF EXISTS "Users read own attendance" ON public.training_attendance;

CREATE POLICY "Admins manage attendance" ON public.training_attendance
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage attendance" ON public.training_attendance
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Users read own attendance" ON public.training_attendance
  FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ==================== teams ====================
DROP POLICY IF EXISTS "Admins manage teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can read teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches manage teams" ON public.teams;

CREATE POLICY "Admins manage teams" ON public.teams
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Coaches manage teams" ON public.teams
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Anyone can read teams" ON public.teams
  FOR SELECT TO authenticated USING (true);
