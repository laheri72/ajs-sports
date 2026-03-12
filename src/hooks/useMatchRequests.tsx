import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export interface MatchRequest {
  id: string;
  sport_id: string;
  created_by: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  max_players: number;
  status: "open" | "full" | "completed";
  created_at: string;
  sports?: { name: string; sport_type: string };
  creator?: { full_name: string | null };
  player_count?: number;
}

export function useMatchRequests(sportFilter?: string) {
  return useQuery({
    queryKey: ["match-requests", sportFilter],
    queryFn: async () => {
      let query = supabase
        .from("match_requests")
        .select("*, sports(name, sport_type), creator:profiles!match_requests_created_by_fkey(full_name)")
        .order("created_at", { ascending: false });

      if (sportFilter) query = query.eq("sport_id", sportFilter);

      const { data, error } = await query;
      if (error) throw error;

      // Get player counts
      const { data: players } = await supabase
        .from("match_request_players")
        .select("request_id");

      const countMap: Record<string, number> = {};
      for (const p of players || []) {
        countMap[p.request_id] = (countMap[p.request_id] || 0) + 1;
      }

      return (data || []).map((r) => ({
        ...r,
        player_count: countMap[r.id] || 0,
      })) as unknown as MatchRequest[];
    },
  });
}

export function useMatchRequestPlayers(requestId: string | null) {
  return useQuery({
    queryKey: ["match-request-players", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_request_players")
        .select("*, profiles:student_tr(full_name, class_name, house_id, houses:house_id(name, color))")
        .eq("request_id", requestId!)
        .order("joined_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useMyMatchJoin(requestId: string | null) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["my-match-join", requestId, profile?.tr_number],
    enabled: !!requestId && !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_request_players")
        .select("*")
        .eq("request_id", requestId!)
        .eq("student_tr", profile!.tr_number)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMatchRequest() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (params: {
      sport_id: string;
      title: string;
      description?: string;
      event_date?: string;
      location?: string;
      max_players: number;
    }) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase.from("match_requests").insert({
        ...params,
        created_by: profile.tr_number,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["match-requests"] });
      toast.success("Match request created!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useJoinMatchRequest() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase.from("match_request_players").insert({
        request_id: requestId,
        student_tr: profile.tr_number,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["match-requests"] });
      qc.invalidateQueries({ queryKey: ["match-request-players"] });
      qc.invalidateQueries({ queryKey: ["my-match-join"] });
      toast.success("Joined match!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useLeaveMatchRequest() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase
        .from("match_request_players")
        .delete()
        .eq("request_id", requestId)
        .eq("student_tr", profile.tr_number);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["match-requests"] });
      qc.invalidateQueries({ queryKey: ["match-request-players"] });
      qc.invalidateQueries({ queryKey: ["my-match-join"] });
      toast.success("Left match");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCompleteMatchRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("match_requests")
        .update({ status: "completed" } as any)
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["match-requests"] });
      toast.success("Match marked as completed");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
