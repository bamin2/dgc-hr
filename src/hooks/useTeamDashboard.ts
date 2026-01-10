import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getTodayString, formatEmployeeName } from '@/lib/dashboard';
import { fetchPendingLeaveRequests, fetchUpcomingTimeOff } from '@/lib/dashboard';

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

      const today = getTodayString();

      // Fetch pending leave requests and upcoming time off for team using shared queries
      const [pendingRes, upcomingRes] = await Promise.all([
        fetchPendingLeaveRequests(teamMemberIds),
        fetchUpcomingTimeOff(today, 10, teamMemberIds),
      ]);

      const upcomingTimeOff = (upcomingRes.data || [])
        .filter((r: any) => r.leave_type?.name !== 'Public Holiday')
        .map((r: any) => ({
          employeeId: r.employee?.id,
          employeeName: formatEmployeeName(r.employee?.first_name, r.employee?.last_name),
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
