import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export interface ClubEventParticipant {
  id: string;
  club_event_id: string;
  student_id: string;
  status: "registered" | "attended" | "absent";
  joined_at: string;
  profiles?: {
    full_name: string | null;
    class_name: string | null;
    darajah: string | null;
    house_id: string | null;
    houses?: { name: string; color: string } | null;
  };
}

export function useEventParticipants(clubEventId: string | null) {
  return useQuery({
    queryKey: ["club-event-participants", clubEventId],
    enabled: !!clubEventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_event_participants")
        .select("*, profiles:student_id(full_name, class_name, darajah, house_id, houses:house_id(name, color))")
        .eq("club_event_id", clubEventId!)
        .order("joined_at");
      if (error) throw error;
      return data as unknown as ClubEventParticipant[];
    },
  });
}

export function useMyEventRegistration(clubEventId: string | null) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["my-event-registration", clubEventId, profile?.tr_number],
    enabled: !!clubEventId && !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_event_participants")
        .select("*")
        .eq("club_event_id", clubEventId!)
        .eq("student_id", profile!.tr_number)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useRegisterForEvent() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (clubEventId: string) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase.from("club_event_participants").insert({
        club_event_id: clubEventId,
        student_id: profile.tr_number,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-event-participants"] });
      qc.invalidateQueries({ queryKey: ["my-event-registration"] });
      toast.success("Registered for event!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useCancelEventRegistration() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (clubEventId: string) => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase
        .from("club_event_participants")
        .delete()
        .eq("club_event_id", clubEventId)
        .eq("student_id", profile.tr_number);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-event-participants"] });
      qc.invalidateQueries({ queryKey: ["my-event-registration"] });
      toast.success("Registration cancelled");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; status: "attended" | "absent" }) => {
      const { error } = await supabase
        .from("club_event_participants")
        .update({ status: params.status } as any)
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-event-participants"] });
      qc.invalidateQueries({ queryKey: ["club-analytics"] });
      toast.success("Attendance updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// Admin analytics
export function useClubAnalytics() {
  return useQuery({
    queryKey: ["club-analytics"],
    queryFn: async () => {
      // Get all events with club info
      const { data: events, error: evErr } = await supabase
        .from("club_events")
        .select("id, club_id, clubs(name, sport_id, sports(name))");
      if (evErr) throw evErr;

      // Get all participants
      const { data: participants, error: pErr } = await supabase
        .from("club_event_participants")
        .select("club_event_id, student_id, status");
      if (pErr) throw pErr;

      // Build analytics per club
      const clubMap: Record<string, {
        name: string;
        sport: string;
        eventsHosted: number;
        totalRegistered: number;
        totalAttended: number;
      }> = {};

      for (const ev of events || []) {
        const cid = ev.club_id;
        if (!clubMap[cid]) {
          clubMap[cid] = {
            name: (ev as any).clubs?.name || "Unknown",
            sport: (ev as any).clubs?.sports?.name || "",
            eventsHosted: 0,
            totalRegistered: 0,
            totalAttended: 0,
          };
        }
        clubMap[cid].eventsHosted++;
      }

      for (const p of participants || []) {
        const ev = events?.find((e) => e.id === p.club_event_id);
        if (!ev) continue;
        const cid = ev.club_id;
        if (!clubMap[cid]) continue;
        clubMap[cid].totalRegistered++;
        if (p.status === "attended") clubMap[cid].totalAttended++;
      }

      const clubStats = Object.entries(clubMap).map(([id, s]) => ({
        id,
        ...s,
        avgAttendance: s.eventsHosted > 0 ? Math.round(s.totalAttended / s.eventsHosted) : 0,
      }));

      // Most active students
      const studentCounts: Record<string, number> = {};
      for (const p of participants || []) {
        if (p.status === "attended") {
          studentCounts[p.student_id] = (studentCounts[p.student_id] || 0) + 1;
        }
      }
      const topStudentIds = Object.entries(studentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      let topStudents: { id: string; name: string; attended: number }[] = [];
      if (topStudentIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("tr_number, full_name")
          .in("tr_number", topStudentIds.map(([id]) => id));
        topStudents = topStudentIds.map(([id, count]) => ({
          id,
          name: profiles?.find((p) => p.tr_number === id)?.full_name || "Unknown",
          attended: count,
        }));
      }

      return { clubStats: clubStats.sort((a, b) => b.eventsHosted - a.eventsHosted), topStudents };
    },
  });
}
