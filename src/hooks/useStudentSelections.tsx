import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SelectionRow {
  id: string;
  season_id: string;
  house_id: string;
  sport_id: string;
  category: string;
  rank: number;
  student_id: string;
  eligibility: string | null;
  is_final: boolean;
  is_locked: boolean;
  created_by: string | null;
}

export function useStudentSelections(
  seasonId: string | null,
  sportId: string | null,
  category: string | null,
  houseId?: string | null
) {
  return useQuery({
    queryKey: ["student-selections", seasonId, houseId, sportId, category],
    enabled: !!seasonId && !!houseId && !!sportId && !!category,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_selections")
        .select("*")
        .eq("season_id", seasonId!)
        .eq("house_id", houseId!)
        .eq("sport_id", sportId!)
        .eq("category", category!)
        .order("rank");
      if (error) throw error;
      return data as SelectionRow[];
    },
  });
}

export function useEventQuota(
  sportId: string | null,
  seasonId: string | null,
  category: string | null
) {
  return useQuery({
    queryKey: ["event-quota", sportId, seasonId, category],
    enabled: !!sportId && !!seasonId && !!category,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("quota_per_house, name, sub_category, age_group")
        .eq("sport_id", sportId!)
        .eq("season_id", seasonId!);
      if (error) throw error;

      const match = data?.find(
        (e: any) => e.sub_category === category || e.age_group === category
      );
      return match?.quota_per_house ?? 10;
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      seasonId,
      sportId,
      category,
      houseId,
      createdBy,
      slots,
    }: {
      seasonId: string;
      sportId: string;
      category: string;
      houseId: string;
      createdBy: string;
      slots: { rank: number; studentId: string | null }[];
    }) => {
      // Check if selections are locked — prevent overwrite
      const { data: existing } = await supabase
        .from("student_selections")
        .select("is_locked")
        .eq("season_id", seasonId)
        .eq("house_id", houseId)
        .eq("sport_id", sportId)
        .eq("category", category)
        .eq("is_locked", true)
        .limit(1);
      if (existing && existing.length > 0) throw new Error("Selections are locked by admin and cannot be edited");

      // Delete existing rows for this combination
      const { error: delError } = await supabase
        .from("student_selections")
        .delete()
        .eq("season_id", seasonId)
        .eq("house_id", houseId)
        .eq("sport_id", sportId)
        .eq("category", category);
      if (delError) throw delError;

      // Insert only filled slots
      const rows = slots
        .filter((s) => s.studentId)
        .map((s) => ({
          season_id: seasonId,
          house_id: houseId,
          sport_id: sportId,
          category,
          rank: s.rank,
          student_id: s.studentId!,
          eligibility: "Eligible",
          created_by: createdBy,
          is_final: false,
          is_locked: false,
        }));

      if (rows.length > 0) {
        const { error } = await supabase
          .from("student_selections")
          .insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-selections"] });
      toast({ title: "Draft saved", description: "Your selection draft has been saved." });
    },
    onError: (err: any) => {
      toast({ title: "Error saving draft", description: err.message, variant: "destructive" });
    },
  });
}

export function useSubmitFinal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      seasonId,
      sportId,
      category,
      houseId,
    }: {
      seasonId: string;
      sportId: string;
      category: string;
      houseId: string;
    }) => {
      const { error } = await supabase
        .from("student_selections")
        .update({ is_final: true })
        .eq("season_id", seasonId)
        .eq("house_id", houseId)
        .eq("sport_id", sportId)
        .eq("category", category);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-selections"] });
      toast({ title: "Submitted", description: "Final selection has been submitted." });
    },
    onError: (err: any) => {
      toast({ title: "Error submitting", description: err.message, variant: "destructive" });
    },
  });
}

export function useToggleAdminLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      seasonId,
      houseId,
      sportId,
      category,
      locked,
    }: {
      seasonId: string;
      houseId: string;
      sportId: string;
      category: string;
      locked: boolean;
    }) => {
      const { error } = await supabase
        .from("student_selections")
        .update({ is_locked: locked })
        .eq("season_id", seasonId)
        .eq("house_id", houseId)
        .eq("sport_id", sportId)
        .eq("category", category);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-selections"] });
      queryClient.invalidateQueries({ queryKey: ["selection-summary"] });
      toast({ title: "Lock updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error toggling lock", description: err.message, variant: "destructive" });
    },
  });
}
