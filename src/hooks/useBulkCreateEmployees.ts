import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";

export function useBulkCreateEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employees: TablesInsert<"employees">[]) => {
      const { data, error } = await supabase
        .from("employees")
        .insert(employees)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
