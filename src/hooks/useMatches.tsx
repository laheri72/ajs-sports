import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMatches() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          qc.invalidateQueries({ queryKey: ["matches"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          event:events(name, sport_id, sports:sport_id(name)),
          home_team:home_team_id(name, house_id, houses:house_id(name, color)),
          away_team:away_team_id(name, house_id, houses:house_id(name, color))
        `)
        .order("match_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
