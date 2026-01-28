import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Users, CalendarDays, TrendingUp } from 'lucide-react';
import { usePendingLeaveRequests, useLeaveRequests } from '@/hooks/useLeaveRequests';

export function LeaveMetrics() {
  const { data: pendingRequests, isLoading: pendingLoading } = usePendingLeaveRequests();
  const { data: allRequests, isLoading: requestsLoading } = useLeaveRequests();
  
  const isLoading = pendingLoading || requestsLoading;
  
  // Calculate employees on leave today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const onLeaveToday = (allRequests || []).filter(request => {
    if (request.status !== 'approved') return false;
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return today >= startDate && today <= endDate;
  }).length;

  // Calculate upcoming leaves (next 7 days)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingLeaves = (allRequests || []).filter(request => {
    if (request.status !== 'approved') return false;
    const startDate = new Date(request.start_date);
    startDate.setHours(0, 0, 0, 0);
    return startDate > today && startDate <= nextWeek;
  }).length;
  
  const metrics = [
    {
      title: 'On Leave Today',
      value: onLeaveToday,
      subtitle: 'Employees currently on leave',
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests?.length || 0,
      subtitle: 'Awaiting approval',
      icon: Users,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Upcoming Leaves',
      value: upcomingLeaves,
      subtitle: 'Starting in next 7 days',
      icon: CalendarDays,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'This Month',
      value: (allRequests || []).filter(r => {
        const startDate = new Date(r.start_date);
        return startDate.getMonth() === today.getMonth() && 
               startDate.getFullYear() === today.getFullYear();
      }).length,
      subtitle: 'Total leave requests',
      icon: TrendingUp,
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
