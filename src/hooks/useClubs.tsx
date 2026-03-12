import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export interface Club {
  id: string;
  sport_id: string;
  name: string;
  description: string | null;
  incharge_id: string | null;
  sub_incharge_id: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  sports?: { name: string; sport_type: string };
  incharge?: { full_name: string | null } | null;
  sub_incharge?: { full_name: string | null } | null;
  member_count?: number;
}

export interface ClubMember {
  id: string;
  club_id: string;
  student_id: string;
  role: string;
  status: string;
  joined_at: string;
  profiles?: { full_name: string | null; class_name: string | null; darajah: string | null; house_id: string | null; houses?: { name: string; color: string } | null };
}

export interface ClubEvent {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_date: string | null;
  location: string | null;
  max_participants: number | null;
  created_at: string;
}

// All clubs with member counts
export function useClubs() {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const { data: clubs, error } = await supabase
        .from("clubs")
        .select("*, sports(name, sport_type), incharge:profiles!clubs_incharge_id_fkey(full_name), sub_incharge:profiles!clubs_sub_incharge_id_fkey(full_name)")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      const { data: members } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("status", "active" as any);

      const countMap: Record<string, number> = {};
      for (const m of members || []) {
        countMap[m.club_id] = (countMap[m.club_id] || 0) + 1;
      }

      return (clubs || []).map((c) => ({ ...c, member_count: countMap[c.id] || 0 })) as unknown as Club[];
    },
  });
}

// All clubs for admin (including inactive)
export function useAdminClubs() {
  return useQuery({
    queryKey: ["admin-clubs"],
    queryFn: async () => {
      const { data: clubs, error } = await supabase
        .from("clubs")
        .select("*, sports(name, sport_type), incharge:profiles!clubs_incharge_id_fkey(full_name), sub_incharge:profiles!clubs_sub_incharge_id_fkey(full_name)")
        .order("name");
      if (error) throw error;

      const { data: members } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("status", "active" as any);

      const countMap: Record<string, number> = {};
      for (const m of members || []) {
        countMap[m.club_id] = (countMap[m.club_id] || 0) + 1;
      }

      return (clubs || []).map((c) => ({ ...c, member_count: countMap[c.id] || 0 })) as unknown as Club[];
    },
  });
}

// Single club detail
export function useClubDetail(clubId: string | null) {
  return useQuery({
    queryKey: ["club-detail", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*, sports(name, sport_type), incharge:profiles!clubs_incharge_id_fkey(full_name), sub_incharge:profiles!clubs_sub_incharge_id_fkey(full_name)")
        .eq("id", clubId!)
        .single();
      if (error) throw error;
      return data as unknown as Club;
    },
  });
}

// Club members
export function useClubMembers(clubId: string | null) {
  return useQuery({
    queryKey: ["club-members", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_members")
        .select("*, profiles:student_id(full_name, class_name, darajah, house_id, houses:house_id(name, color))")
        .eq("club_id", clubId!)
        .eq("status", "active" as any)
        .order("joined_at");
      if (error) throw error;
      return data as ClubMember[];
    },
  });
}

// Club events
export function useClubEvents(clubId: string | null) {
  return useQuery({
    queryKey: ["club-events", clubId],
    enabled: !!clubId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_events")
        .select("*")
        .eq("club_id", clubId!)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as ClubEvent[];
    },
  });
}

// Check if current user is a member of a club
export function useMyMembership(clubId: string | null) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["my-membership", clubId, profile?.tr_number],
    enabled: !!clubId && !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_members")
        .select("*")
        .eq("club_id", clubId!)
        .eq("student_id", profile!.tr_number)
        .eq("status", "active" as any)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// Join club
export function useJoinClub() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (clubId: string) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase.from("club_members").insert({
        club_id: clubId,
        student_id: profile.tr_number,
        role: "member" as any,
        status: "active" as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      qc.invalidateQueries({ queryKey: ["club-members"] });
      qc.invalidateQueries({ queryKey: ["my-membership"] });
      qc.invalidateQueries({ queryKey: ["my-interests"] });
      toast.success("Joined club!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// Leave club
export function useLeaveClub() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (clubId: string) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("club_id", clubId)
        .eq("student_id", profile.tr_number);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      qc.invalidateQueries({ queryKey: ["club-members"] });
      qc.invalidateQueries({ queryKey: ["my-membership"] });
      toast.success("Left club");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// Admin: create club
export function useCreateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; sport_id: string; description?: string; incharge_id?: string; sub_incharge_id?: string; created_by?: string }) => {
      const { error } = await supabase.from("clubs").insert(params);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      qc.invalidateQueries({ queryKey: ["admin-clubs"] });
      toast.success("Club created!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// Admin: update club
export function useUpdateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("clubs").update(params.updates).eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      qc.invalidateQueries({ queryKey: ["admin-clubs"] });
      qc.invalidateQueries({ queryKey: ["club-detail"] });
      toast.success("Club updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// Admin: create club event
export function useCreateClubEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { club_id: string; title: string; event_type: string; description?: string; event_date?: string; location?: string; max_participants?: number; created_by?: string }) => {
      const { error } = await supabase.from("club_events").insert(params as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-events"] });
      toast.success("Event created!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
