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
        .select("id, user_id, full_name")
        .eq("house_id", houseId!);
      if (pErr) throw pErr;

      const userIds = profiles.map((p) => p.user_id);
      if (!userIds.length) return [];

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds)
        .in("role", ["captain", "co_captain"]);
      if (rErr) throw rErr;

      return profiles.map((p) => ({
        ...p,
        roles: roles.filter((r) => r.user_id === p.user_id).map((r) => r.role),
      }));
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "captain" | "co_captain";
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role })
        .select();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-roles"] });
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
      userId,
      role,
    }: {
      userId: string;
      role: "captain" | "co_captain";
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-roles"] });
      toast({ title: "Role removed" });
    },
    onError: (err: any) => {
      toast({ title: "Error removing role", description: err.message, variant: "destructive" });
    },
  });
}
