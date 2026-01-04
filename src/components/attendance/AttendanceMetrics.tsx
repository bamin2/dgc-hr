import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, Calendar } from 'lucide-react';
import { getTodayAttendanceSummary, getPendingLeaveRequests } from '@/data/attendance';

export function AttendanceMetrics() {
  const summary = getTodayAttendanceSummary();
  const pendingRequests = getPendingLeaveRequests();
  
  const metrics = [
    {
      title: 'Present Today',
      value: summary.present,
      subtitle: `${Math.round((summary.present / summary.total) * 100)}% attendance`,
      icon: UserCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'On Leave',
      value: summary.onLeave,
      subtitle: 'Employees on leave today',
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Late Arrivals',
      value: summary.late,
      subtitle: 'Arrived after 9:00 AM',
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      subtitle: 'Awaiting approval',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-semibold mt-1">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${metric.iconBg}`}>
                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
