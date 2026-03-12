import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HouseMember {
  tr_number: number;
  user_id: string;
  full_name: string | null;
  house_id: string | null;
}

export function useHouseMembers(houseId: string | null) {
  return useQuery({
    queryKey: ["house-members", houseId],
    enabled: !!houseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("tr_number, user_id, full_name, house_id")
        .eq("house_id", houseId!)
        .order("full_name");
      if (error) throw error;
      return data as HouseMember[];
    },
  });
}
