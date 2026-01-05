import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave' | 'half_day' | 'remote';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  work_hours: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
  };
}

interface UseAttendanceRecordsOptions {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  status?: AttendanceStatus;
}

export function useAttendanceRecords(options: UseAttendanceRecordsOptions = {}) {
  const { startDate, endDate, employeeId, status } = options;

  return useQuery({
    queryKey: ['attendance-records', { startDate, endDate, employeeId, status }],
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
    queryKey: ['attendance-summary', format(targetDate, 'yyyy-MM-dd')],
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

      // Calculate absent as total employees minus those with records
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
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
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
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
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
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      toast.success('Attendance record deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete attendance: ${error.message}`);
    },
  });
}
