import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LeaveRequestInsertRecord } from '@/utils/leaveHistoryImport';

const CHUNK_SIZE = 100;

export function useBulkCreateLeaveRequests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records: LeaveRequestInsertRecord[]) => {
      let inserted = 0;
      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        const { error, data } = await supabase
          .from('leave_requests')
          .insert(chunk)
          .select('id');
        if (error) throw error;
        inserted += data?.length || 0;
      }
      return { inserted };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-leave-requests'] });
    },
  });
}
