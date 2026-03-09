
-- Add top_8_points to events table for individual sport ranking
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS top_8_points integer DEFAULT 0;

-- Add sport_category to sports table (e.g. "Endurance Sports", "Water Sports", etc.)
ALTER TABLE public.sports ADD COLUMN IF NOT EXISTS category text;
