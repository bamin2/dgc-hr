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

const Index = () => {
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
            <MetricsCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Time Tracker & Projects */}
              <div className="space-y-6">
                <TimeTracker />
                <ProjectEvaluation />
              </div>

              {/* Middle Column - Calendar & Charts */}
              <div className="space-y-6">
                <CalendarWidget />
                <WorkHoursChart />
              </div>

              {/* Right Column - Team & Meetings */}
              <div className="space-y-6">
                <DailyTimeLimits />
                <MeetingCards />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Announcements />
              <AttendanceOverview />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;