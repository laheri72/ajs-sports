import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEligibleStudents(houseIdOverride?: string | null) {
  return useQuery({
    queryKey: ["eligible-students", houseIdOverride],
    enabled: !!houseIdOverride,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, class_name, darajah, is_under_18")
        .eq("house_id", houseIdOverride!)
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });
}
