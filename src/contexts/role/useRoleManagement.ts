import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserRole } from '@/data/roles';

interface UseRoleManagementResult {
  getEmployeeRole: (employeeId: string) => AppRole;
  updateEmployeeRole: (employeeId: string, newRole: AppRole) => Promise<{ error?: string }>;
}

export function useRoleManagement(
  userRoles: UserRole[],
  setUserRoles: React.Dispatch<React.SetStateAction<UserRole[]>>
): UseRoleManagementResult {
  const getEmployeeRole = useCallback(
    (employeeId: string): AppRole => {
      const userRole = userRoles.find(ur => ur.userId === employeeId);
      return userRole?.role || 'employee';
    },
    [userRoles]
  );

  const updateEmployeeRole = useCallback(
    async (employeeId: string, newRole: AppRole): Promise<{ error?: string }> => {
      // First, find the user_id associated with this employee
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('employee_id', employeeId)
        .single();

      if (profileError || !profileData) {
        console.error('No user account linked to this employee:', profileError);
        return { error: 'No user account linked to this employee. Create a login first.' };
      }

      const userId = profileData.id;

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

      if (error) {
        console.error('Failed to update role:', error);
        return { error: 'Failed to update role in database.' };
      }

      // Update local state with employeeId
      setUserRoles(prev => {
        const filtered = prev.filter(ur => ur.userId !== employeeId);
        return [...filtered, { id: `role-${employeeId}`, userId: employeeId, role: newRole }];
      });

      return {};
    },
    [setUserRoles]
  );

  return { getEmployeeRole, updateEmployeeRole };
}
