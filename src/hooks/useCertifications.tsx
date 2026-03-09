import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export interface Certification {
  id: string;
  student_id: string;
  sport_id: string;
  score_snapshot: number;
  proficiency_level: string;
  certificate_number: string;
  issued_by: string | null;
  issued_at: string;
  valid_year: number;
  notes: string | null;
  status: "draft" | "issued" | "revoked";
  created_at: string;
  profiles?: { full_name: string | null; class_name: string | null; darajah: string | null; tr_number: string | null };
  sports?: { name: string; sport_type: string };
  issuer?: { full_name: string | null };
}

export function useCertifications(year?: number) {
  return useQuery({
    queryKey: ["certifications", year],
    queryFn: async () => {
      let query = supabase
        .from("certifications")
        .select("*, profiles:student_id(full_name, class_name, darajah, tr_number), sports:sport_id(name, sport_type), issuer:issued_by(full_name)")
        .order("issued_at", { ascending: false });

      if (year) query = query.eq("valid_year", year);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Certification[];
    },
  });
}

export function useMyCertifications() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["my-certifications", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*, sports:sport_id(name, sport_type)")
        .eq("student_id", profile!.id)
        .eq("status", "issued")
        .order("valid_year", { ascending: false });
      if (error) throw error;
      return data as unknown as Certification[];
    },
  });
}

export function useCertificationById(id: string) {
  return useQuery({
    queryKey: ["certification", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*, profiles:student_id(full_name, class_name, darajah, tr_number), sports:sport_id(name, sport_type), issuer:issued_by(full_name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as Certification;
    },
  });
}

export function useIssueCertificate() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ studentId, sportId, score, level, year, notes }: {
      studentId: string; sportId: string; score: number; level: string; year: number; notes?: string;
    }) => {
      // Generate certificate number
      const { data: certNum, error: numErr } = await supabase.rpc("generate_certificate_number", { p_year: year });
      if (numErr) throw numErr;

      const { data, error } = await supabase.from("certifications").insert({
        student_id: studentId,
        sport_id: sportId,
        score_snapshot: score,
        proficiency_level: level as any,
        certificate_number: certNum,
        issued_by: profile?.id,
        valid_year: year,
        notes: notes || null,
        status: "issued" as any,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certificate issued successfully!");
    },
    onError: (e: any) => {
      if (e.message?.includes("unique")) {
        toast.error("This student already has a certificate for this sport this year.");
      } else {
        toast.error(e.message);
      }
    },
  });
}

export function useRevokeCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (certId: string) => {
      const { error } = await supabase.from("certifications").update({ status: "revoked" as any }).eq("id", certId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certifications"] });
      toast.success("Certificate revoked.");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
