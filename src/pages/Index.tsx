import {
  Sidebar,
  Header,
  MetricsCards,
  TimeTracker,
  ProjectEvaluation,
  CalendarWidget,
  WorkHoursChart,
  DailyTimeLimits,
  MeetingCards,
  Announcements,
  AttendanceOverview,
  ImpersonationBanner,
} from "@/components/dashboard";
import { useDashboardCardVisibility } from "@/hooks/useDashboardCardVisibility";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { visibility, isLoading } = useDashboardCardVisibility();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const hasMainCards = visibility.timeTracker || visibility.projectEvaluation || 
    visibility.calendarWidget || visibility.workHoursChart || 
    visibility.dailyTimeLimits || visibility.meetingCards;
  const hasBottomCards = visibility.announcements || visibility.attendanceOverview;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <ImpersonationBanner />
        <Header />

        <main className="flex-1 p-4 sm:p-6 overflow-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {visibility.metrics && <MetricsCards />}

            {hasMainCards && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {visibility.timeTracker && <TimeTracker />}
                {visibility.projectEvaluation && <ProjectEvaluation />}
                {visibility.calendarWidget && <CalendarWidget />}
                {visibility.workHoursChart && <WorkHoursChart />}
                {visibility.dailyTimeLimits && <DailyTimeLimits />}
                {visibility.meetingCards && <MeetingCards />}
              </div>
            )}

            {hasBottomCards && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {visibility.announcements && <Announcements />}
                {visibility.attendanceOverview && <AttendanceOverview />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;