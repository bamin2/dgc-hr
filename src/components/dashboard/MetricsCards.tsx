import { Users, TrendingUp, UserCheck, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const metrics = [
  {
    title: "Total Employees",
    value: "248",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "30-Day Hires",
    value: "18",
    change: "+8%",
    changeType: "positive" as const,
    icon: TrendingUp,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    title: "Attendance Today",
    value: "236",
    change: "95%",
    changeType: "neutral" as const,
    icon: UserCheck,
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    title: "Avg. Work Hours",
    value: "7.8h",
    change: "-2%",
    changeType: "negative" as const,
    icon: Clock,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
];

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
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
                {metric.changeType !== "neutral" && " from last month"}
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