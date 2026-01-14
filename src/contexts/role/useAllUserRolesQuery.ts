import { useQuery } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/data/roles';
import { queryKeys } from '@/lib/queryKeys';

interface UseAllUserRolesQueryResult {
  userRoles: UserRole[];
  isLoading: boolean;
}

export function useAllUserRolesQuery(user: User | null): UseAllUserRolesQueryResult {
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: queryKeys.roles.allUserRoles,
    queryFn: async (): Promise<UserRole[]> => {
      // Fetch user_roles and employees separately, then merge
      // employees.user_id is now the single source of truth for user-employee linkage
      const [rolesResult, employeesResult] = await Promise.all([
        supabase.from('user_roles').select('id, user_id, role'),
        supabase.from('employees').select('id, user_id'),
      ]);

      if (rolesResult.error || !rolesResult.data) {
        return [];
      }

      // Build a map of user_id -> employee_id
      const employeesMap = new Map<string, string>();
      if (!employeesResult.error && employeesResult.data) {
        employeesResult.data.forEach(e => {
          if (e.user_id) {
            employeesMap.set(e.user_id, e.id);
          }
        });
      }

      return rolesResult.data.map(r => ({
        id: r.id,
        userId: employeesMap.get(r.user_id) || r.user_id,
        role: r.role,
      }));
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    retry: 0,  // Don't retry auth-dependent queries
  });

  return { userRoles, isLoading };
}
