import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSeasons() {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seasons")
        .select("id, name, is_active")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSports() {
  return useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("id, name, sport_type")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useEventCategories(sportId: string | null, seasonId: string | null) {
  return useQuery({
    queryKey: ["event-categories", sportId, seasonId],
    enabled: !!sportId && !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("sub_category, age_group")
        .eq("sport_id", sportId!)
        .eq("season_id", seasonId!);
      if (error) throw error;
      // Derive unique categories from sub_category or age_group
      const categories = new Set<string>();
      data.forEach((e) => {
        if (e.sub_category) categories.add(e.sub_category);
        else if (e.age_group) categories.add(e.age_group);
      });
      return Array.from(categories).sort();
    },
  });
}
