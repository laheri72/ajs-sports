import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });
}

export function useIsAdmin() {
  const { data: roles, isLoading } = useUserRole();
  return { isAdmin: roles?.includes("admin") ?? false, isLoading };
}

export function useIsCoach() {
  const { data: roles, isLoading } = useUserRole();
  return { isCoach: roles?.includes("coach") ?? false, isLoading };
}
