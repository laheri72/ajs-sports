import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface House {
  id: string;
  name: string;
  color: string;
}

export function useHouses() {
  return useQuery({
    queryKey: ["houses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("houses")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as House[];
    },
  });
}
