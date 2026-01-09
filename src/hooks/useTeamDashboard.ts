import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export interface TeamDashboardData {
  teamMemberCount: number;
  pendingApprovals: {
    leaveRequests: number;
  };
  upcomingTimeOff: {
    employeeId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    leaveTypeName: string;
    daysCount: number;
  }[];
}

export function useTeamDashboard(teamMemberIds: string[]) {
  return useQuery({
    queryKey: queryKeys.dashboard.team(teamMemberIds),
    queryFn: async (): Promise<TeamDashboardData> => {
      if (!teamMemberIds.length) {
        return {
          teamMemberCount: 0,
          pendingApprovals: { leaveRequests: 0 },
          upcomingTimeOff: [],
        };
      }

      const today = new Date().toISOString().split('T')[0];

      // Fetch pending leave requests and upcoming time off for team
      const [pendingRes, upcomingRes] = await Promise.all([
        supabase
          .from('leave_requests')
          .select('id')
          .in('employee_id', teamMemberIds)
          .eq('status', 'pending'),
        
        supabase
          .from('leave_requests')
          .select(`
            id, start_date, end_date, days_count,
            employee:employees (first_name, last_name, id),
            leave_type:leave_types (name)
          `)
          .in('employee_id', teamMemberIds)
          .eq('status', 'approved')
          .gte('start_date', today)
          .order('start_date', { ascending: true })
          .limit(10),
      ]);

      const upcomingTimeOff = (upcomingRes.data || []).map((r: any) => ({
        employeeId: r.employee?.id,
        employeeName: `${r.employee?.first_name || ''} ${r.employee?.last_name || ''}`.trim(),
        startDate: r.start_date,
        endDate: r.end_date,
        leaveTypeName: r.leave_type?.name || 'Leave',
        daysCount: r.days_count,
      }));

      return {
        teamMemberCount: teamMemberIds.length,
        pendingApprovals: {
          leaveRequests: pendingRes.data?.length || 0,
        },
        upcomingTimeOff,
      };
    },
    enabled: teamMemberIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
