import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // First get the student_tr for this user_id
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("tr_number")
        .eq("user_id", user!.id)
        .maybeSingle();
      
      if (pErr) throw pErr;
      if (!profile) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("student_tr", profile.tr_number);
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
