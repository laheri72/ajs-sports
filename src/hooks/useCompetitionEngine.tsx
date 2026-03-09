import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function callEngine(action: string, params: Record<string, any> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await supabase.functions.invoke("competition-engine", {
    body: { action, ...params },
  });

  if (res.error) throw new Error(res.error.message);
  if (!res.data?.success) throw new Error(res.data?.error || "Unknown error");
  return res.data;
}

export function useGenerateParticipations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: string) => callEngine("generate_participations", { seasonId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["participations"] });
      toast.success(data.message);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useGenerateTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: string) => callEngine("generate_teams", { seasonId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      toast.success(data.message);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useGenerateFixtures() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: string) => callEngine("generate_fixtures", { seasonId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["standings"] });
      toast.success(data.message);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useRecordResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { matchId: string; homeScore: number; awayScore: number; winnerId: string | null }) =>
      callEngine("record_result", params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["standings"] });
      toast.success(data.message);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useGeneratePlayoffs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: string) => callEngine("generate_playoffs", { seasonId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
      qc.invalidateQueries({ queryKey: ["competition-counts"] });
      toast.success(data.message);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useComputeStandings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: string) => callEngine("compute_standings", { seasonId }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["standings"] });
      qc.invalidateQueries({ queryKey: ["point-transactions"] });
      toast.success(data.message);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useAdminMatches(seasonId: string | null, eventId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!seasonId) return;
    const channel = supabase
      .channel(`admin-matches-rt-${seasonId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          qc.invalidateQueries({ queryKey: ["admin-matches"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc, seasonId]);

  return useQuery({
    queryKey: ["admin-matches", seasonId, eventId],
    enabled: !!seasonId && !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:home_team_id(id, name, house_id, houses:house_id(name, color)),
          away_team:away_team_id(id, name, house_id, houses:house_id(name, color))
        `)
        .eq("season_id", seasonId!)
        .eq("event_id", eventId!)
        .order("stage")
        .order("match_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminStandings(seasonId: string | null, eventId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!seasonId) return;
    const channel = supabase
      .channel(`admin-standings-rt-${seasonId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_standings" },
        () => {
          qc.invalidateQueries({ queryKey: ["standings"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc, seasonId]);

  return useQuery({
    queryKey: ["standings", seasonId, eventId],
    enabled: !!seasonId && !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_standings")
        .select(`*, team:teams(name, house_id, houses:house_id(name, color))`)
        .eq("season_id", seasonId!)
        .eq("event_id", eventId!)
        .order("points", { ascending: false })
        .order("goal_diff", { ascending: false })
        .order("goals_for" as any, { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
