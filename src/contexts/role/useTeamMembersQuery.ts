import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

interface UseTeamMembersQueryResult {
  teamMemberIds: string[];
  isLoading: boolean;
}

export function useTeamMembersQuery(employeeId: string | null | undefined): UseTeamMembersQueryResult {
  const { data: teamMemberIds = [], isLoading } = useQuery({
    queryKey: queryKeys.roles.teamMembers(employeeId || 'none'),
    queryFn: async (): Promise<string[]> => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('manager_id', employeeId);

      if (error || !data) {
        return [];
      }

      return data.map(e => e.id);
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - team structure doesn't change often
    gcTime: 10 * 60 * 1000,
  });

  return { teamMemberIds, isLoading };
}
