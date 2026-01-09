import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTeamMembersResult {
  teamMemberIds: string[];
  isLoading: boolean;
}

export function useTeamMembers(employeeId: string | null | undefined): UseTeamMembersResult {
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!employeeId) {
        setTeamMemberIds([]);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('manager_id', employeeId);

      if (!error && data) {
        setTeamMemberIds(data.map(e => e.id));
      } else {
        setTeamMemberIds([]);
      }

      setIsLoading(false);
    };

    fetchTeamMembers();
  }, [employeeId]);

  return { teamMemberIds, isLoading };
}
