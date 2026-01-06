import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmployeeImport {
  id: string;
  imported_by: string | null;
  imported_at: string;
  filename: string | null;
  total_records: number;
  successful_records: number;
  failed_records: number;
  status: string;
  rolled_back_at: string | null;
  rolled_back_by: string | null;
  created_at: string;
}

export function useEmployeeImports() {
  return useQuery({
    queryKey: ["employee-imports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_imports")
        .select("*")
        .order("imported_at", { ascending: false });

      if (error) throw error;
      return data as EmployeeImport[];
    },
  });
}

export function useRollbackImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete all employees from this batch
      const { error: deleteError } = await supabase
        .from("employees")
        .delete()
        .eq("import_batch_id", importId);

      if (deleteError) throw deleteError;

      // Update import record status
      const { error: updateError } = await supabase
        .from("employee_imports")
        .update({
          status: "rolled_back",
          rolled_back_at: new Date().toISOString(),
          rolled_back_by: user.id,
        })
        .eq("id", importId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-imports"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
