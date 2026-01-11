import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export interface DashboardMetrics {
  totalEmployees: number;
  newHires: number;
  todayAttendance: number;
  avgWorkHours: string;
  attendanceRate: number;
  previousTotalEmployees: number;
  previousNewHires: number;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');
      const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

      // Run all queries in parallel for better performance
      const [
        totalEmployeesResult,
        newHiresResult,
        previousNewHiresResult,
        todayAttendanceResult,
        workHoursResult
      ] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('employees').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
        supabase.from('employees').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo),
        supabase.from('attendance_records').select('id', { count: 'exact', head: true }).eq('date', today).in('status', ['present', 'late', 'remote']),
        supabase.from('attendance_records').select('work_hours').gte('date', sevenDaysAgo).not('work_hours', 'is', null),
      ]);

      const totalEmployees = totalEmployeesResult.count;
      const newHires = newHiresResult.count;
      const previousNewHires = previousNewHiresResult.count;
      const todayAttendance = todayAttendanceResult.count;
      const workHoursData = workHoursResult.data;

      const avgWorkHours = workHoursData?.length 
        ? workHoursData.reduce((sum, r) => sum + (r.work_hours || 0), 0) / workHoursData.length
        : 0;

      const attendanceRate = totalEmployees && totalEmployees > 0 
        ? Math.round(((todayAttendance || 0) / totalEmployees) * 100) 
        : 0;

      return {
        totalEmployees: totalEmployees || 0,
        newHires: newHires || 0,
        todayAttendance: todayAttendance || 0,
        avgWorkHours: avgWorkHours.toFixed(1),
        attendanceRate,
        previousTotalEmployees: totalEmployees || 0,
        previousNewHires: previousNewHires || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export interface TodayAttendanceRecord {
  id: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  check_in: string | null;
  status: string;
}

export function useTodayAttendance(limit = 5) {
  return useQuery({
    queryKey: ['today-attendance', limit],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Run all queries in parallel
      const [recordsResult, presentCountResult, absentCountResult] = await Promise.all([
        supabase
          .from('attendance_records')
          .select(`
            id,
            check_in,
            status,
            employee:employees(id, first_name, last_name, avatar_url)
          `)
          .eq('date', today)
          .order('check_in', { ascending: false, nullsFirst: false })
          .limit(limit),
        supabase
          .from('attendance_records')
          .select('id', { count: 'exact', head: true })
          .eq('date', today)
          .in('status', ['present', 'late', 'remote']),
        supabase
          .from('attendance_records')
          .select('id', { count: 'exact', head: true })
          .eq('date', today)
          .eq('status', 'absent'),
      ]);

      if (recordsResult.error) throw recordsResult.error;

      return {
        records: (recordsResult.data || []).map(record => ({
          id: record.id,
          employee: record.employee as TodayAttendanceRecord['employee'],
          check_in: record.check_in,
          status: record.status,
        })),
        presentCount: presentCountResult.count || 0,
        absentCount: absentCountResult.count || 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export interface WeeklyWorkHours {
  day: string;
  hours: number;
  date: string;
}

export function useWeeklyWorkHours() {
  return useQuery({
    queryKey: ['weekly-work-hours'],
    queryFn: async () => {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from('attendance_records')
        .select('date, work_hours')
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      if (error) throw error;

      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const hoursPerDay: Record<string, number[]> = {};

      // Group work hours by date
      (data || []).forEach(record => {
        if (!hoursPerDay[record.date]) {
          hoursPerDay[record.date] = [];
        }
        if (record.work_hours) {
          hoursPerDay[record.date].push(record.work_hours);
        }
      });

      // Build weekly data
      const weeklyData: WeeklyWorkHours[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayHours = hoursPerDay[dateStr] || [];
        const avgHours = dayHours.length > 0 
          ? dayHours.reduce((a, b) => a + b, 0) / dayHours.length 
          : 0;

        weeklyData.push({
          day: dayNames[i],
          hours: Math.round(avgHours * 10) / 10,
          date: dateStr,
        });
      }

      const totalHours = weeklyData.reduce((sum, d) => sum + d.hours, 0);
      const workedDays = weeklyData.filter(d => d.hours > 0).length;
      const dailyAvg = workedDays > 0 ? totalHours / workedDays : 0;
      const overtime = Math.max(0, totalHours - 40); // Assuming 40h work week

      return {
        data: weeklyData,
        totalHours: Math.round(totalHours * 10) / 10,
        overtime: Math.round(overtime * 10) / 10,
        dailyAvg: Math.round(dailyAvg * 10) / 10,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export interface TeamMemberTimeLimit {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  hours: number;
  maxHours: number;
  status: 'online' | 'away' | 'offline';
}

export function useTeamTimeLimits(limit = 4) {
  return useQuery({
    queryKey: ['team-time-limits', limit],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          work_hours,
          check_in,
          check_out,
          employee:employees(
            id,
            first_name,
            last_name,
            avatar_url,
            position:positions(title)
          )
        `)
        .eq('date', today)
        .not('employee', 'is', null)
        .order('check_in', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(record => {
        const emp = record.employee as any;
        const hasCheckedIn = !!record.check_in;
        const hasCheckedOut = !!record.check_out;
        
        return {
          id: emp?.id || record.id,
          name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
          role: emp?.position?.title || null,
          avatar_url: emp?.avatar_url || null,
          hours: record.work_hours || 0,
          maxHours: 8,
          status: hasCheckedIn && !hasCheckedOut ? 'online' : hasCheckedOut ? 'away' : 'offline',
        } as TeamMemberTimeLimit;
      });
    },
    staleTime: 1000 * 60 * 2,
  });
}
