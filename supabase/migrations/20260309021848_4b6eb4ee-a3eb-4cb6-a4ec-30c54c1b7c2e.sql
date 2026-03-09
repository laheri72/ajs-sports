
ALTER TABLE public.team_standings ADD COLUMN IF NOT EXISTS goals_for numeric DEFAULT 0;
ALTER TABLE public.team_standings ADD COLUMN IF NOT EXISTS goals_against numeric DEFAULT 0;
