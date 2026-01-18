import { DollarSign, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PayrollMetricsProps {
  totalPayroll: number;
  employeesPaid: number;
  pendingPayments: number;
  averageSalary: number;
  currency?: string;
}

export function PayrollMetrics({
  totalPayroll,
  employeesPaid,
  pendingPayments,
  averageSalary,
  currency = "USD",
}: PayrollMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const metrics = [
    {
      title: "Total Payroll",
      value: formatCurrency(totalPayroll),
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
      value: formatCurrency(averageSalary),
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
              <div className="space-y-1 min-w-0 flex-1 mr-3">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className={cn(
                  "font-bold text-foreground break-words",
                  metric.value.length > 15 ? "text-lg" : "text-2xl",
                  metric.value.length > 20 ? "text-base" : ""
                )}>{metric.value}</p>
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
