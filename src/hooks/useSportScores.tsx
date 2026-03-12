import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StudentSportScore {
  id: string;
  student_tr: number;
  sport_id: string;
  competition_score: number;
  club_score: number;
  activity_score: number;
  fitness_score: number;
  total_score: number;
  proficiency_level: string;
  last_calculated: string;
  profiles?: {
    full_name: string | null;
    class_name: string | null;
    darajah: string | null;
    tr_number: number | null;
    house_id: string | null;
    houses?: { name: string; color: string } | null;
  };
  sports?: { name: string; sport_type: string };
}

export function useSportScores(sportFilter?: string) {
  return useQuery({
    queryKey: ["sport-scores", sportFilter],
    queryFn: async () => {
      let query = supabase
        .from("student_sport_scores")
        .select("*, profiles:student_tr(full_name, class_name, darajah, tr_number, house_id, houses:house_id(name, color)), sports:sport_id(name, sport_type)")
        .order("total_score", { ascending: false });

      if (sportFilter && sportFilter !== "all") {
        query = query.eq("sport_id", sportFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as StudentSportScore[];
    },
  });
}

export function useRecalculateScores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("recalculate-scores", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sport-scores"] });
      toast.success(`Scores recalculated! (${data?.recalculated || 0} student-sport combinations)`);
    },
    onError: (e: any) => toast.error(e.message),
  });
}
