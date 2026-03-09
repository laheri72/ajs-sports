
-- ============================================
-- SportSync ASP Database Schema (PostgreSQL)
-- ============================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('student', 'coach', 'admin', 'parent');
CREATE TYPE public.event_role AS ENUM ('player', 'captain', 'coach', 'musaid', 'substitute', 'volunteer');
CREATE TYPE public.participation_status AS ENUM ('registered', 'selected', 'declined', 'withdrawn');
CREATE TYPE public.match_stage AS ENUM ('group', 'quarterfinal', 'semifinal', 'final', 'third_place');
CREATE TYPE public.sport_type AS ENUM ('team', 'individual');
CREATE TYPE public.event_level AS ENUM ('prime', 'standard');
CREATE TYPE public.point_source AS ENUM ('placement', 'participation', 'wildcard', 'bonus', 'penalty');

-- Seasons
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Houses (Red, Green, Blue, Yellow)
CREATE TABLE public.houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hizb (8 named teams, each mapped to a House)
CREATE TABLE public.hizb (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  tr_number TEXT UNIQUE,
  birth_date DATE,
  age_category TEXT, -- 'A-18', 'U-18', derived from DOB
  house_id UUID REFERENCES public.houses(id),
  hizb_id UUID REFERENCES public.hizb(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles (app-level: student, coach, admin, parent)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Sports master list
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sport_type sport_type NOT NULL DEFAULT 'individual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sub_category TEXT,
  level event_level DEFAULT 'standard',
  age_group TEXT, -- 'A-18', 'U-18', 'Open'
  quota_per_house INT NOT NULL DEFAULT 0,
  playing_lineup INT DEFAULT 0,
  reserved_u18 INT DEFAULT 0,
  substitutes INT DEFAULT 0,
  total_players INT DEFAULT 0,
  group_stage_desc TEXT,
  playoff_desc TEXT,
  points_1st INT DEFAULT 0,
  points_2nd INT DEFAULT 0,
  points_3rd INT DEFAULT 0,
  points_4th INT DEFAULT 0,
  participation_points INT DEFAULT 0,
  is_team_event BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Wildcard programs
CREATE TABLE public.wildcard_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  program_name TEXT,
  quota_per_house INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams (for team events)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  house_id UUID REFERENCES public.houses(id),
  event_id UUID REFERENCES public.events(id),
  age_group TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role event_role DEFAULT 'player',
  UNIQUE(team_id, student_id)
);

-- Participations (registrations)
CREATE TABLE public.participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  student_id UUID REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  house_id UUID NOT NULL REFERENCES public.houses(id),
  hizb_id UUID REFERENCES public.hizb(id),
  status participation_status DEFAULT 'registered',
  is_wildcard BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT now()
);

-- Student Event Roles (player, captain, coach, musaid, substitute, volunteer)
CREATE TABLE public.student_event_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  role event_role NOT NULL,
  UNIQUE(student_id, event_id, role)
);

-- Results (placement)
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  participation_id UUID NOT NULL REFERENCES public.participations(id),
  placement INT,
  points_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Point Transactions Ledger (multi-source points)
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  house_id UUID NOT NULL REFERENCES public.houses(id),
  student_id UUID REFERENCES public.profiles(id),
  event_id UUID REFERENCES public.events(id),
  source point_source NOT NULL,
  points INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matches (for team sports)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  match_date TIMESTAMPTZ,
  stage match_stage DEFAULT 'group',
  home_team_id UUID REFERENCES public.teams(id),
  away_team_id UUID REFERENCES public.teams(id),
  home_score NUMERIC,
  away_score NUMERIC,
  winner_team_id UUID REFERENCES public.teams(id),
  -- Cricket-specific
  home_runs_for NUMERIC,
  home_overs_faced NUMERIC,
  away_runs_for NUMERIC,
  away_overs_faced NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team standings (group stage)
CREATE TABLE public.team_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  lost INT DEFAULT 0,
  drawn INT DEFAULT 0,
  goal_diff NUMERIC DEFAULT 0,
  net_run_rate NUMERIC DEFAULT 0,
  points INT DEFAULT 0
);

-- Trainings (pre-requisites like Trifit)
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id),
  season_id UUID REFERENCES public.seasons(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training attendance
CREATE TABLE public.training_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attended_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(training_id, student_id)
);

-- Achievements / badges
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT now()
);

-- Fitness logs
CREATE TABLE public.fitness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  speed NUMERIC,
  agility NUMERIC,
  endurance NUMERIC,
  strength NUMERIC,
  flexibility NUMERIC,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hizb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wildcard_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_event_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKS
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Seasons, Houses, Hizb, Sports: publicly readable
CREATE POLICY "Anyone can read seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Anyone can read houses" ON public.houses FOR SELECT USING (true);
CREATE POLICY "Anyone can read hizb" ON public.hizb FOR SELECT USING (true);
CREATE POLICY "Anyone can read sports" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can read wildcard_programs" ON public.wildcard_programs FOR SELECT USING (true);
CREATE POLICY "Anyone can read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anyone can read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Anyone can read results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Anyone can read point_transactions" ON public.point_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can read team_standings" ON public.team_standings FOR SELECT USING (true);
CREATE POLICY "Anyone can read trainings" ON public.trainings FOR SELECT USING (true);
CREATE POLICY "Anyone can read student_event_roles" ON public.student_event_roles FOR SELECT USING (true);
CREATE POLICY "Anyone can read participations" ON public.participations FOR SELECT USING (true);

-- Admin write policies for reference data
CREATE POLICY "Admins manage seasons" ON public.seasons FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage houses" ON public.houses FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage hizb" ON public.hizb FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage sports" ON public.sports FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage wildcard_programs" ON public.wildcard_programs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage teams" ON public.teams FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage team_members" ON public.team_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage results" ON public.results FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage point_transactions" ON public.point_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage team_standings" ON public.team_standings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage trainings" ON public.trainings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage student_event_roles" ON public.student_event_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage participations" ON public.participations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coach write policies
CREATE POLICY "Coaches manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage matches" ON public.matches FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage results" ON public.results FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage teams" ON public.teams FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage team_members" ON public.team_members FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage team_standings" ON public.team_standings FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage participations" ON public.participations FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage student_event_roles" ON public.student_event_roles FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Coaches manage point_transactions" ON public.point_transactions FOR ALL USING (public.has_role(auth.uid(), 'coach'));

-- Profiles: users read all, manage own
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles: users read own, admins manage all
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage user_roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Training attendance: users read own, coaches/admins manage
CREATE POLICY "Users read own attendance" ON public.training_attendance FOR SELECT USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Coaches manage attendance" ON public.training_attendance FOR ALL USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Admins manage attendance" ON public.training_attendance FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Achievements: users read own + public
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Fitness logs: users manage own
CREATE POLICY "Users read own fitness" ON public.fitness_logs FOR SELECT USING (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users insert own fitness" ON public.fitness_logs FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Coaches read all fitness" ON public.fitness_logs FOR SELECT USING (public.has_role(auth.uid(), 'coach'));
CREATE POLICY "Admins manage fitness" ON public.fitness_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Students can register themselves for events
CREATE POLICY "Students register self" ON public.participations FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SEED: Houses & Hizb
-- ============================================
INSERT INTO public.houses (name, color) VALUES
  ('Red', 'hsl(0, 72%, 50%)'),
  ('Green', 'hsl(152, 60%, 45%)'),
  ('Blue', 'hsl(210, 72%, 50%)'),
  ('Yellow', 'hsl(45, 92%, 55%)');

INSERT INTO public.seasons (name, is_active, start_date, end_date) VALUES
  ('ASP 2026', true, '2026-01-01', '2026-12-31');
