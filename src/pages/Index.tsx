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

  // Check if any cards are visible in each column
  const leftColumnVisible = visibility.timeTracker || visibility.projectEvaluation;
  const middleColumnVisible = visibility.calendarWidget || visibility.workHoursChart;
  const rightColumnVisible = visibility.dailyTimeLimits || visibility.meetingCards;
  const bottomRowVisible = visibility.announcements || visibility.attendanceOverview;
  const mainGridVisible = leftColumnVisible || middleColumnVisible || rightColumnVisible;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Impersonation Banner */}
        <ImpersonationBanner />
        
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Metrics Row */}
            {visibility.metrics && <MetricsCards />}

            {/* Main Content Grid */}
            {mainGridVisible && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Time Tracker & Projects */}
                {leftColumnVisible && (
                  <div className="space-y-6">
                    {visibility.timeTracker && <TimeTracker />}
                    {visibility.projectEvaluation && <ProjectEvaluation />}
                  </div>
                )}

                {/* Middle Column - Calendar & Charts */}
                {middleColumnVisible && (
                  <div className="space-y-6">
                    {visibility.calendarWidget && <CalendarWidget />}
                    {visibility.workHoursChart && <WorkHoursChart />}
                  </div>
                )}

                {/* Right Column - Team & Meetings */}
                {rightColumnVisible && (
                  <div className="space-y-6">
                    {visibility.dailyTimeLimits && <DailyTimeLimits />}
                    {visibility.meetingCards && <MeetingCards />}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Row */}
            {bottomRowVisible && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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