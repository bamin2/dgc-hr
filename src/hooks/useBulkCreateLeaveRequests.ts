import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LeaveRequestInsertRecord } from '@/utils/leaveHistoryImport';

const CHUNK_SIZE = 100;

function dedupeKey(r: Pick<LeaveRequestInsertRecord, 'employee_id' | 'leave_type_id' | 'start_date' | 'end_date'>) {
  return `${r.employee_id}|${r.leave_type_id}|${r.start_date}|${r.end_date}`;
}

export function useBulkCreateLeaveRequests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records: LeaveRequestInsertRecord[]) => {
      if (records.length === 0) return { inserted: 0, skipped: 0 };

      // Pre-fetch existing leave requests for the affected employees to filter out duplicates
      const employeeIds = Array.from(new Set(records.map(r => r.employee_id)));
      const existingKeys = new Set<string>();

      // Query in chunks to avoid huge IN clauses
      for (let i = 0; i < employeeIds.length; i += CHUNK_SIZE) {
        const chunk = employeeIds.slice(i, i + CHUNK_SIZE);
        const { data, error } = await supabase
          .from('leave_requests')
          .select('employee_id, leave_type_id, start_date, end_date')
          .in('employee_id', chunk);
        if (error) throw error;
        for (const row of data || []) {
          existingKeys.add(dedupeKey(row as any));
        }
      }

      // Filter out records that already exist OR are duplicates within the batch itself
      const seenInBatch = new Set<string>();
      const toInsert: LeaveRequestInsertRecord[] = [];
      let skipped = 0;
      for (const r of records) {
        const key = dedupeKey(r);
        if (existingKeys.has(key) || seenInBatch.has(key)) {
          skipped++;
          continue;
        }
        seenInBatch.add(key);
        toInsert.push(r);
      }

      let inserted = 0;
      for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
        const chunk = toInsert.slice(i, i + CHUNK_SIZE);
        const { error, data } = await supabase
          .from('leave_requests')
          .insert(chunk)
          .select('id');
        if (error) throw error;
        inserted += data?.length || 0;
      }
      return { inserted, skipped };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-leave-requests'] });
    },
  });
}
