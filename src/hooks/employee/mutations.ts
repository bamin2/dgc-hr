import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Shared employee mutations to be used by both useEmployees and useTeamMembers hooks.
 * This eliminates duplication and ensures consistent cache invalidation.
 */

// Invalidate all employee-related queries
function invalidateEmployeeQueries(queryClient: ReturnType<typeof useQueryClient>, employeeId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
  
  if (employeeId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(employeeId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.detail(employeeId) });
  }
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: TablesInsert<"employees">) => {
      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateEmployeeQueries(queryClient);
    },
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...employee
    }: TablesUpdate<"employees"> & { id: string }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(employee)
        .eq("id", id)
        .select("*, user_id")
        .single();

      if (error) throw error;

      // Sync avatar to profiles table if employee has a linked user
      if (employee.avatar_url !== undefined && data.user_id) {
        await supabase
          .from('profiles')
          .update({ avatar_url: employee.avatar_url })
          .eq('id', data.user_id);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      invalidateEmployeeQueries(queryClient, variables.id);
      // Also invalidate user preferences to refresh avatar in settings
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      invalidateEmployeeQueries(queryClient, id);
    },
  });
}
