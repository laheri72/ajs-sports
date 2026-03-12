import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export type InterestLevel = "curious" | "beginner" | "learning" | "active" | "competitive";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface SportsInterest {
  id: string;
  student_tr: string;
  sport_id: string;
  interest_level: InterestLevel;
  confidence_level: ConfidenceLevel;
  created_by: string;
  notes: string | null;
  is_identified_talent: boolean;
  created_at: string;
  updated_at: string;
  sports?: { name: string; sport_type: string };
}

export function useMyInterests() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["my-interests", profile?.tr_number],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports_interests")
        .select("*, sports(name, sport_type)")
        .eq("student_tr", profile!.tr_number)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SportsInterest[];
    },
  });
}

export function useUpsertInterest() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (params: {
      sport_id: string;
      interest_level: InterestLevel;
      confidence_level: ConfidenceLevel;
      notes?: string;
    }) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase
        .from("sports_interests")
        .upsert(
          [{
            student_tr: profile.tr_number,
            sport_id: params.sport_id,
            interest_level: params.interest_level,
            confidence_level: params.confidence_level,
            notes: params.notes || null,
            created_by: "student" as const,
          }],
          { onConflict: "student_tr,sport_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-interests"] });
      toast.success("Interest saved!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sports_interests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-interests"] });
      toast.success("Interest removed");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// Admin: all interests with student + sport info
export function useAllInterests(filters?: { sportId?: string; interestLevel?: string; talentOnly?: boolean }) {
  return useQuery({
    queryKey: ["all-interests", filters?.sportId, filters?.interestLevel, filters?.talentOnly],
    queryFn: async () => {
      let query = supabase
        .from("sports_interests")
        .select("*, sports(name, sport_type), profiles:student_tr(full_name, class_name, darajah, house_id, houses:house_id(name, color))")
        .order("created_at", { ascending: false });

      if (filters?.sportId) query = query.eq("sport_id", filters.sportId);
      if (filters?.interestLevel) query = query.eq("interest_level", filters.interestLevel as any);
      if (filters?.talentOnly) query = query.eq("is_identified_talent", true);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Needs coaching: beginner/curious + low confidence
export function useNeedsCoaching() {
  return useQuery({
    queryKey: ["needs-coaching"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports_interests")
        .select("*, sports(name, sport_type), profiles:student_tr(full_name, class_name, darajah, house_id, houses:house_id(name, color))")
        .in("interest_level", ["curious", "beginner"] as any)
        .eq("confidence_level", "low" as any)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Analytics: count per sport
export function useInterestAnalytics() {
  return useQuery({
    queryKey: ["interest-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports_interests")
        .select("sport_id, interest_level, is_identified_talent, sports(name)");
      if (error) throw error;

      const bySport: Record<string, { name: string; total: number; curious: number; beginner: number; learning: number; active: number; competitive: number; identified: number }> = {};
      for (const row of data || []) {
        const sid = row.sport_id;
        if (!bySport[sid]) {
          bySport[sid] = { name: (row as any).sports?.name || "Unknown", total: 0, curious: 0, beginner: 0, learning: 0, active: 0, competitive: 0, identified: 0 };
        }
        bySport[sid].total++;
        bySport[sid][row.interest_level as InterestLevel]++;
        if (row.is_identified_talent) bySport[sid].identified++;
      }
      return Object.values(bySport).sort((a, b) => b.total - a.total);
    },
  });
}

// Admin: update interest level
export function useAdminUpdateInterest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; interest_level?: InterestLevel; is_identified_talent?: boolean }) => {
      const updates: any = {};
      if (params.interest_level) updates.interest_level = params.interest_level;
      if (params.is_identified_talent !== undefined) updates.is_identified_talent = params.is_identified_talent;
      const { error } = await supabase.from("sports_interests").update(updates).eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-interests"] });
      qc.invalidateQueries({ queryKey: ["interest-analytics"] });
      qc.invalidateQueries({ queryKey: ["needs-coaching"] });
      toast.success("Updated successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
