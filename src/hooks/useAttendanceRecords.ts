import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { queryKeys } from '@/lib/queryKeys';
import { queryPresets } from '@/lib/queryOptions';
import type { AttendanceRecord, AttendanceStatus, AttendanceRecordFilters } from '@/types/attendance';

// Re-export types for backward compatibility
export type { AttendanceRecord, AttendanceStatus };

export function useAttendanceRecords(options: AttendanceRecordFilters = {}) {
  const { startDate, endDate, employeeId, status } = options;

  return useQuery({
    queryKey: queryKeys.attendance.records.withFilters({ startDate, endDate, employeeId, status }),
    queryFn: async () => {
      let query = supabase
        .from('attendance_records')
        .select(`
          *,
          employee:employees!attendance_records_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            department:departments!employees_department_id_fkey (
              id,
              name
            )
          )
        `)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
      }
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    placeholderData: keepPreviousData,  // Prevent blank state on filter changes
    ...queryPresets.userData,
  });
}

export function useCurrentMonthAttendance() {
  const now = new Date();
  return useAttendanceRecords({
    startDate: startOfMonth(now),
    endDate: endOfMonth(now),
  });
}

export function useTodayAttendance() {
  const today = new Date();
  return useAttendanceRecords({
    startDate: today,
    endDate: today,
  });
}

export function useAttendanceSummary(date?: Date) {
  const targetDate = date || new Date();

  return useQuery({
    queryKey: queryKeys.attendance.summary(format(targetDate, 'yyyy-MM-dd')),
    queryFn: async () => {
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('date', dateStr);

      if (error) throw error;

      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const summary = {
        present: 0,
        absent: 0,
        late: 0,
        on_leave: 0,
        half_day: 0,
        remote: 0,
        total: totalEmployees || 0,
      };

      data?.forEach((record) => {
        if (record.status in summary) {
          summary[record.status as keyof typeof summary]++;
        }
      });

      const recordedCount = data?.length || 0;
      summary.absent = Math.max(0, (totalEmployees || 0) - recordedCount);

      return summary;
    },
  });
}

export function useCreateAttendanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at' | 'employee'>) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.records.all });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      toast.success('Attendance recorded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to record attendance: ${error.message}`);
    },
  });
}

export function useUpdateAttendanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AttendanceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.records.all });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      toast.success('Attendance updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update attendance: ${error.message}`);
    },
  });
}

export function useDeleteAttendanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.records.all });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      toast.success('Attendance record deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete attendance: ${error.message}`);
    },
  });
}
