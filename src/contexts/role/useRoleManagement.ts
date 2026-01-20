import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserRole } from '@/data/roles';
import { queryKeys } from '@/lib/queryKeys';

interface UseRoleManagementResult {
  getEmployeeRole: (employeeId: string) => AppRole;
  updateEmployeeRole: (employeeId: string, newRole: AppRole) => Promise<{ error?: string }>;
}

export function useRoleManagement(
  userRoles: UserRole[],
  setUserRoles: React.Dispatch<React.SetStateAction<UserRole[]>>
): UseRoleManagementResult {
  const queryClient = useQueryClient();

  const getEmployeeRole = useCallback(
    (employeeId: string): AppRole => {
      const userRole = userRoles.find(ur => ur.userId === employeeId);
      return userRole?.role || 'employee';
    },
    [userRoles]
  );

  const updateEmployeeRole = useCallback(
    async (employeeId: string, newRole: AppRole): Promise<{ error?: string }> => {
      // Find the user_id associated with this employee from employees table (single source of truth)
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('user_id')
        .eq('id', employeeId)
        .single();

      if (employeeError || !employeeData?.user_id) {
        console.error('No user account linked to this employee:', employeeError);
        return { error: 'No user account linked to this employee. Create a login first.' };
      }

      const userId = employeeData.user_id;

      // Delete existing roles for this user first, then insert the new one
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
        });

      // If the role already exists (idempotent update), treat it as success
      if (error) {
        const isDuplicateRole =
          error.code === '23505' ||
          /duplicate key value|already exists/i.test(error.message || '');

        if (!isDuplicateRole) {
          console.error('Failed to update role:', error);
          return { error: 'Failed to update role in database.' };
        }
      }

      // Update local state using BOTH identifiers so lookups work whether the UI
      // keys roles by employeeId or by auth user_id.
      setUserRoles(prev => {
        const filtered = prev.filter(ur => ur.userId !== employeeId && ur.userId !== userId);
        return [
          ...filtered,
          { id: `role-emp-${employeeId}`, userId: employeeId, role: newRole },
          { id: `role-user-${userId}`, userId: userId, role: newRole },
        ];
      });

      // Invalidate the React Query cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.allUserRoles });

      return {};
    },
    [setUserRoles, queryClient]
  );

  return useMemo(
    () => ({ getEmployeeRole, updateEmployeeRole }),
    [getEmployeeRole, updateEmployeeRole]
  );
}
