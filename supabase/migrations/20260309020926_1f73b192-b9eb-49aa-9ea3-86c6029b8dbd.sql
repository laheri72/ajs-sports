
-- House leaderboard view: aggregates points by source per house per season
CREATE OR REPLACE VIEW public.house_leaderboard_view AS
SELECT
  pt.season_id,
  pt.house_id,
  h.name AS house_name,
  h.color AS house_color,
  COALESCE(SUM(pt.points), 0)::int AS total_points,
  COALESCE(SUM(pt.points) FILTER (WHERE pt.source = 'placement'), 0)::int AS placement_points,
  COALESCE(SUM(pt.points) FILTER (WHERE pt.source = 'participation'), 0)::int AS participation_points,
  COALESCE(SUM(pt.points) FILTER (WHERE pt.source = 'bonus'), 0)::int AS bonus_points,
  (SELECT COUNT(*)::int FROM public.profiles p WHERE p.house_id = pt.house_id) AS member_count
FROM public.point_transactions pt
JOIN public.houses h ON h.id = pt.house_id
GROUP BY pt.season_id, pt.house_id, h.name, h.color;

-- Student rankings view: aggregates points per student per season
CREATE OR REPLACE VIEW public.student_rankings_view AS
SELECT
  pt.season_id,
  pt.student_id,
  pr.full_name AS student_name,
  pr.house_id,
  h.name AS house_name,
  pr.user_id,
  COALESCE(SUM(pt.points), 0)::int AS total_points,
  COUNT(*) FILTER (WHERE pt.source = 'placement')::int AS placements,
  COUNT(*) FILTER (WHERE pt.source = 'participation')::int AS participations
FROM public.point_transactions pt
JOIN public.profiles pr ON pr.id = pt.student_id
LEFT JOIN public.houses h ON h.id = pr.house_id
WHERE pt.student_id IS NOT NULL
GROUP BY pt.season_id, pt.student_id, pr.full_name, pr.house_id, h.name, pr.user_id;
