import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useHouseRoles(houseId: string | null) {
  return useQuery({
    queryKey: ["house-roles", houseId],
    enabled: !!houseId,
    queryFn: async () => {
      // Get all profiles in the house, then get their roles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("tr_number, user_id, full_name")
        .eq("house_id", houseId!);
      if (pErr) throw pErr;

      const trNumbers = profiles.map((p) => p.tr_number);
      if (!trNumbers.length) return [];

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("student_tr, role")
        .in("student_tr", trNumbers)
        .in("role", ["captain", "co_captain"]);
      if (rErr) throw rErr;

      return profiles.map((p) => ({
        ...p,
        roles: roles.filter((r: any) => r.student_tr === p.tr_number).map((r: any) => r.role),
      }));
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trNumber,
      role,
    }: {
      trNumber: string;
      role: "captain" | "co_captain";
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ student_tr: trNumber, role } as any)
        .select();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-roles"] });
      queryClient.invalidateQueries({ queryKey: ["house-members-roles"] });
      toast({ title: "Role assigned" });
    },
    onError: (err: any) => {
      toast({ title: "Error assigning role", description: err.message, variant: "destructive" });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trNumber,
      role,
    }: {
      trNumber: string;
      role: "captain" | "co_captain";
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("student_tr", trNumber)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-roles"] });
      queryClient.invalidateQueries({ queryKey: ["house-members-roles"] });
      toast({ title: "Role removed" });
    },
    onError: (err: any) => {
      toast({ title: "Error removing role", description: err.message, variant: "destructive" });
    },
  });
}
