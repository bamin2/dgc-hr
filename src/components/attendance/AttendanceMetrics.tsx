import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, Clock, Calendar } from 'lucide-react';
import { useAttendanceSummary } from '@/hooks/useAttendanceRecords';
import { usePendingLeaveRequests } from '@/hooks/useLeaveRequests';

export function AttendanceMetrics() {
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary();
  const { data: pendingRequests, isLoading: requestsLoading } = usePendingLeaveRequests();
  
  const isLoading = summaryLoading || requestsLoading;
  
  const metrics = [
    {
      title: 'Present Today',
      value: summary?.present || 0,
      subtitle: summary?.total ? `${Math.round((summary.present / summary.total) * 100)}% attendance` : '0% attendance',
      icon: UserCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'On Leave',
      value: summary?.on_leave || 0,
      subtitle: 'Employees on leave today',
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Late Arrivals',
      value: summary?.late || 0,
      subtitle: 'Arrived after 9:00 AM',
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests?.length || 0,
      subtitle: 'Awaiting approval',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
