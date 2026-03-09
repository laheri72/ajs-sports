import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SelectionSummary {
  house_id: string;
  house_name: string;
  house_color: string;
  sport_name: string;
  sport_id: string;
  category: string;
  total: number;
  final_count: number;
  locked_count: number;
}

export function useSelectionSummary(seasonId: string | null) {
  return useQuery({
    queryKey: ["selection-summary", seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_selections")
        .select(`
          house_id,
          sport_id,
          category,
          is_final,
          is_locked,
          houses:house_id(name, color),
          sports:sport_id(name)
        `)
        .eq("season_id", seasonId!);
      if (error) throw error;

      // Group by house_id + sport_id + category
      const groups: Record<string, SelectionSummary> = {};
      for (const row of data || []) {
        const key = `${row.house_id}_${row.sport_id}_${row.category}`;
        if (!groups[key]) {
          groups[key] = {
            house_id: row.house_id,
            house_name: (row.houses as any)?.name || "?",
            house_color: (row.houses as any)?.color || "#888",
            sport_name: (row.sports as any)?.name || "?",
            sport_id: row.sport_id,
            category: row.category,
            total: 0,
            final_count: 0,
            locked_count: 0,
          };
        }
        groups[key].total++;
        if (row.is_final) groups[key].final_count++;
        if (row.is_locked) groups[key].locked_count++;
      }

      return Object.values(groups).sort((a, b) => 
        a.sport_name.localeCompare(b.sport_name) || 
        a.category.localeCompare(b.category) || 
        a.house_name.localeCompare(b.house_name)
      );
    },
  });
}
