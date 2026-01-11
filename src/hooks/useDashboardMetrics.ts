import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { measureAsync } from '@/lib/perf';
import { queryPresets } from '@/lib/queryOptions';

// ==================== INTERFACES ====================

export interface DashboardMetrics {
  totalEmployees: number;
  newHires: number;
  todayAttendance: number;
  avgWorkHours: string;
  attendanceRate: number;
  previousTotalEmployees: number;
  previousNewHires: number;
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

export interface WeeklyWorkHours {
  day: string;
  hours: number;
  date: string;
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

// ==================== RPC RESPONSE TYPES ====================

interface RPCMetrics {
  totalEmployees: number;
  newHires: number;
  previousNewHires: number;
  todayAttendance: number;
  avgWorkHours: number;
  attendanceRate: number;
}

interface RPCAttendanceRecord {
  id: string;
  check_in: string | null;
  status: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface RPCTodayAttendance {
  records: RPCAttendanceRecord[];
  presentCount: number;
  absentCount: number;
}

interface RPCWeeklyWorkHours {
  data: WeeklyWorkHours[];
  totalHours: number;
  overtime: number;
  dailyAvg: number;
}

interface RPCTeamMember {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  hours: number;
  maxHours: number;
  status: 'online' | 'away' | 'offline';
}

interface DashboardRPCResponse {
  metrics: RPCMetrics;
  todayAttendance: RPCTodayAttendance;
  weeklyWorkHours: RPCWeeklyWorkHours;
  teamTimeLimits: RPCTeamMember[];
}

// ==================== UNIFIED DATA STRUCTURE ====================

interface DashboardData {
  metrics: DashboardMetrics;
  todayAttendance: {
    records: TodayAttendanceRecord[];
    presentCount: number;
    absentCount: number;
  };
  weeklyWorkHours: {
    data: WeeklyWorkHours[];
    totalHours: number;
    overtime: number;
    dailyAvg: number;
  };
  teamTimeLimits: TeamMemberTimeLimit[];
}

// ==================== UNIFIED HOOK (Single RPC Call) ====================

export function useDashboardData(attendanceLimit = 5, teamLimit = 4) {
  return useQuery({
    queryKey: ['dashboard-data', attendanceLimit, teamLimit],
    queryFn: () => measureAsync('Dashboard: RPC', async (): Promise<DashboardData> => {
      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_attendance_limit: attendanceLimit,
        p_team_limit: teamLimit,
      });

      if (error) throw error;
      
      const result = data as unknown as DashboardRPCResponse;
      
      return {
        metrics: {
          totalEmployees: result.metrics.totalEmployees,
          newHires: result.metrics.newHires,
          todayAttendance: result.metrics.todayAttendance,
          avgWorkHours: String(result.metrics.avgWorkHours),
          attendanceRate: result.metrics.attendanceRate,
          previousTotalEmployees: result.metrics.totalEmployees,
          previousNewHires: result.metrics.previousNewHires,
        },
        todayAttendance: {
          records: result.todayAttendance.records.map(r => ({
            id: r.id,
            employee: r.employee,
            check_in: r.check_in,
            status: r.status,
          })),
          presentCount: result.todayAttendance.presentCount,
          absentCount: result.todayAttendance.absentCount,
        },
        weeklyWorkHours: {
          data: result.weeklyWorkHours.data,
          totalHours: result.weeklyWorkHours.totalHours,
          overtime: result.weeklyWorkHours.overtime,
          dailyAvg: result.weeklyWorkHours.dailyAvg,
        },
        teamTimeLimits: result.teamTimeLimits,
      };
    }),
    ...queryPresets.liveData,
  });
}

// ==================== LEGACY HOOKS (Backward Compatible Wrappers) ====================

const defaultMetrics: DashboardMetrics = {
  totalEmployees: 0,
  newHires: 0,
  todayAttendance: 0,
  avgWorkHours: '0',
  attendanceRate: 0,
  previousTotalEmployees: 0,
  previousNewHires: 0,
};

const defaultTodayAttendance = {
  records: [] as TodayAttendanceRecord[],
  presentCount: 0,
  absentCount: 0,
};

const defaultWeeklyWorkHours = {
  data: [] as WeeklyWorkHours[],
  totalHours: 0,
  overtime: 0,
  dailyAvg: 0,
};

export function useDashboardMetrics() {
  const { data, isLoading, error } = useDashboardData();
  return { 
    data: data?.metrics ?? defaultMetrics, 
    isLoading, 
    error 
  };
}

export function useTodayAttendance(limit = 5) {
  const { data, isLoading, error } = useDashboardData(limit);
  return { 
    data: data?.todayAttendance ?? defaultTodayAttendance, 
    isLoading, 
    error 
  };
}

export function useWeeklyWorkHours() {
  const { data, isLoading, error } = useDashboardData();
  return { 
    data: data?.weeklyWorkHours ?? defaultWeeklyWorkHours, 
    isLoading, 
    error 
  };
}

export function useTeamTimeLimits(limit = 4) {
  const { data, isLoading, error } = useDashboardData(5, limit);
  return { 
    data: data?.teamTimeLimits ?? [], 
    isLoading, 
    error 
  };
}
