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
      // Only fetch roles and profiles when actually needed (for role management)
      // This is a lazy query that's only used by HR/Admin for role management
      const [rolesResult, profilesResult] = await Promise.all([
        supabase.from('user_roles').select('id, user_id, role'),
        supabase.from('profiles').select('id, employee_id'),
      ]);

      if (rolesResult.error || !rolesResult.data) {
        return [];
      }

      // Build a map of user_id -> employee_id
      const profilesMap = new Map<string, string>();
      if (!profilesResult.error && profilesResult.data) {
        profilesResult.data.forEach(p => {
          if (p.employee_id) {
            profilesMap.set(p.id, p.employee_id);
          }
        });
      }

      return rolesResult.data.map(r => ({
        id: r.id,
        userId: profilesMap.get(r.user_id) || r.user_id,
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
