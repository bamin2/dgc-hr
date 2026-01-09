import { useQuery } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, CurrentUser, mockCurrentUser } from '@/data/roles';
import { getHighestPriorityRole } from './constants';
import { queryKeys } from '@/lib/queryKeys';

interface Profile {
  id: string;
  employee_id: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface UseCurrentUserRoleQueryResult {
  currentUser: CurrentUser;
  isLoading: boolean;
}

export function useCurrentUserRoleQuery(
  user: User | null,
  profile: Profile | null
): UseCurrentUserRoleQueryResult {
  const { data: role, isLoading } = useQuery({
    queryKey: queryKeys.roles.currentUser(user?.id || 'anonymous'),
    queryFn: async (): Promise<AppRole> => {
      if (!user) return 'employee';

      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error || !rolesData || rolesData.length === 0) {
        return 'employee';
      }

      return getHighestPriorityRole(rolesData.map(r => r.role as AppRole));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - roles don't change often
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Build the CurrentUser object
  const currentUser: CurrentUser = user
    ? {
        id: user.id,
        name: profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || 'User'
          : user.email || 'User',
        email: user.email || '',
        role: role || 'employee',
        avatar: profile?.avatar_url || '',
      }
    : mockCurrentUser;

  return { currentUser, isLoading };
}
