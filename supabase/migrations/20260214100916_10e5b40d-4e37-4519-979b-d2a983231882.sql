
-- Create student_selections table
CREATE TABLE public.student_selections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id uuid NOT NULL REFERENCES public.seasons(id),
  house_id uuid NOT NULL REFERENCES public.houses(id),
  sport_id uuid NOT NULL REFERENCES public.sports(id),
  category text NOT NULL,
  rank integer NOT NULL,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  eligibility text DEFAULT 'Eligible',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Unique constraint to prevent duplicate slot assignments
ALTER TABLE public.student_selections
  ADD CONSTRAINT uq_selection_slot UNIQUE (season_id, house_id, sport_id, category, rank);

-- Index for fast student lookups
CREATE INDEX idx_student_selections_student_id ON public.student_selections (student_id);

-- Enable RLS (no policies yet — Day 2)
ALTER TABLE public.student_selections ENABLE ROW LEVEL SECURITY;
