import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";

interface BulkCreateParams {
  employees: TablesInsert<"employees">[];
  filename: string;
  totalRecords: number;
  failedRecords: number;
}

export function useBulkCreateEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employees, filename, totalRecords, failedRecords }: BulkCreateParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create import record first
      const { data: importRecord, error: importError } = await supabase
        .from("employee_imports")
        .insert({
          imported_by: user.id,
          filename,
          total_records: totalRecords,
          successful_records: employees.length,
          failed_records: failedRecords,
        })
        .select()
        .single();

      if (importError) throw importError;

      // Add import_batch_id to all employees
      const employeesWithBatch = employees.map(e => ({
        ...e,
        import_batch_id: importRecord.id,
      }));

      // Insert employees
      const { data, error } = await supabase
        .from("employees")
        .insert(employeesWithBatch)
        .select();

      if (error) throw error;
      return { employees: data, importRecord };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee-imports"] });
    },
  });
}

