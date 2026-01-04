import { DollarSign, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PayrollMetricsProps {
  totalPayroll: number;
  employeesPaid: number;
  pendingPayments: number;
  averageSalary: number;
}

export function PayrollMetrics({
  totalPayroll,
  employeesPaid,
  pendingPayments,
  averageSalary,
}: PayrollMetricsProps) {
  const metrics = [
    {
      title: "Total Payroll",
      value: `$${totalPayroll.toLocaleString()}`,
      subtitle: "This month",
      icon: DollarSign,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Employees Paid",
      value: employeesPaid.toString(),
      subtitle: "Completed",
      icon: Users,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "Pending Payments",
      value: pendingPayments.toString(),
      subtitle: "Awaiting processing",
      icon: Clock,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      title: "Average Salary",
      value: `$${averageSalary.toLocaleString()}`,
      subtitle: "Per employee/month",
      icon: TrendingUp,
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${metric.iconBg}`}>
                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
