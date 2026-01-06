import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useRole } from '@/contexts/RoleContext';
import { DashboardCardVisibility } from '@/data/settings';

const defaultVisibility: DashboardCardVisibility = {
  metrics: true,
  timeTracker: true,
  projectEvaluation: true,
  calendarWidget: true,
  workHoursChart: true,
  dailyTimeLimits: true,
  meetingCards: true,
  announcements: true,
  attendanceOverview: true,
};

export function useDashboardCardVisibility() {
  const { settings, isLoading } = useCompanySettings();
  const { canManageRoles } = useRole();

  // HR/Admin always see all cards
  if (canManageRoles) {
    return {
      visibility: defaultVisibility,
      isLoading,
      showAll: true,
    };
  }

  // Employees see configured visibility
  const visibility = settings?.dashboardCardVisibility ?? defaultVisibility;

  return {
    visibility,
    isLoading,
    showAll: false,
  };
}
