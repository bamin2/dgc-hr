import { Users, TrendingUp, UserCheck, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

export function MetricsCards() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  const metricsData = [
    {
      title: "Total Employees",
      value: metrics?.totalEmployees?.toString() || "0",
      change: metrics?.totalEmployees ? `${metrics.totalEmployees} active` : "0 active",
      changeType: "neutral" as const,
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "30-Day Hires",
      value: metrics?.newHires?.toString() || "0",
      change: metrics?.newHires && metrics?.previousNewHires 
        ? calculateChange(metrics.newHires, metrics.previousNewHires)
        : "this month",
      changeType: (metrics?.newHires || 0) >= (metrics?.previousNewHires || 0) 
        ? "positive" as const 
        : "negative" as const,
      icon: TrendingUp,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "Attendance Today",
      value: metrics?.todayAttendance?.toString() || "0",
      change: `${metrics?.attendanceRate || 0}%`,
      changeType: "neutral" as const,
      icon: UserCheck,
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
    {
      title: "Avg. Work Hours",
      value: `${metrics?.avgWorkHours || "0"}h`,
      change: parseFloat(metrics?.avgWorkHours || "0") >= 8 ? "On target" : "Below target",
      changeType: parseFloat(metrics?.avgWorkHours || "0") >= 8 
        ? "positive" as const 
        : "negative" as const,
      icon: Clock,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric) => (
        <Card
          key={metric.title}
          className="p-5 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                {metric.title}
              </p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              <p
                className={cn(
                  "text-sm font-medium",
                  metric.changeType === "positive" && "text-success",
                  metric.changeType === "negative" && "text-destructive",
                  metric.changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {metric.change}
              </p>
            </div>
            <div className={cn("p-3 rounded-xl", metric.iconBg)}>
              <metric.icon className={cn("w-6 h-6", metric.iconColor)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
