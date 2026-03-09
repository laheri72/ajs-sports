import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HouseRanking {
  house_id: string;
  house_name: string;
  house_color: string;
  total_points: number;
  placement_points: number;
  participation_points: number;
  bonus_points: number;
  member_count: number;
}

export function useHouseLeaderboard(seasonId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("house-leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "point_transactions" },
        () => {
          qc.invalidateQueries({ queryKey: ["house-leaderboard"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["house-leaderboard", seasonId],
    queryFn: async () => {
      let sid = seasonId;
      if (!sid) {
        const { data: season } = await supabase
          .from("seasons")
          .select("id")
          .eq("is_active", true)
          .single();
        sid = season?.id;
      }
      if (!sid) return [];

      const { data, error } = await supabase
        .from("house_leaderboard_view" as any)
        .select("*")
        .eq("season_id", sid)
        .order("total_points", { ascending: false });

      if (error) throw error;

      const { data: allHouses } = await supabase
        .from("houses")
        .select("id, name, color");

      const viewMap = new Map(
        ((data as any[]) || []).map((r: any) => [r.house_id, r])
      );

      const rankings: HouseRanking[] = (allHouses || []).map((h) => {
        const row = viewMap.get(h.id);
        return {
          house_id: h.id,
          house_name: row?.house_name ?? h.name,
          house_color: row?.house_color ?? h.color,
          total_points: row?.total_points ?? 0,
          placement_points: row?.placement_points ?? 0,
          participation_points: row?.participation_points ?? 0,
          bonus_points: row?.bonus_points ?? 0,
          member_count: row?.member_count ?? 0,
        };
      });

      rankings.sort((a, b) => b.total_points - a.total_points);
      return rankings;
    },
  });
}
