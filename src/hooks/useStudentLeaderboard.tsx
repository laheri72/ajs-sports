import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudentRanking {
  student_tr: string;
  full_name: string;
  house_name: string;
  total_points: number;
  user_id: string;
  placements: number;
  participations: number;
}

export function useStudentLeaderboard(seasonId?: string) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("student-leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "point_transactions" },
        () => {
          qc.invalidateQueries({ queryKey: ["student-leaderboard"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["student-leaderboard", seasonId],
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
        .from("student_rankings_view" as any)
        .select("*")
        .eq("season_id", sid)
        .order("total_points", { ascending: false })
        .limit(100);

      if (error) throw error;

      const rankings: StudentRanking[] = ((data as any[]) || []).map((r: any) => ({
        student_tr: r.student_tr,
        full_name: r.student_name || "Unknown",
        house_name: r.house_name || "",
        total_points: r.total_points ?? 0,
        user_id: r.user_id,
        placements: r.placements ?? 0,
        participations: r.participations ?? 0,
      }));

      return rankings;
    },
  });
}
