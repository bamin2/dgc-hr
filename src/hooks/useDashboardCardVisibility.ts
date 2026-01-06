import { useCompanySettings } from '@/contexts/CompanySettingsContext';
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

  const visibility = settings?.dashboardCardVisibility ?? defaultVisibility;

  return {
    visibility,
    isLoading,
  };
}
