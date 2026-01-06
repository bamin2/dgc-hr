import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, DollarSign, Clock, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportDashboardStats } from '@/hooks/useReportAnalytics';

interface ReportsMetricsProps {
  stats: ReportDashboardStats;
}

export const ReportsMetrics = ({ stats }: ReportsMetricsProps) => {
  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      subtitle: `${stats.activeEmployees} active`,
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      subtitle: 'Last 30 days average',
      icon: UserCheck,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Average Salary',
      value: `$${stats.averageSalary.toLocaleString()}`,
      subtitle: 'Per employee',
      icon: DollarSign,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves.toString(),
      subtitle: 'Awaiting approval',
      icon: Clock,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Monthly Payroll',
      value: `$${(stats.monthlyPayroll / 1000).toFixed(0)}K`,
      subtitle: 'Total compensation',
      icon: Wallet,
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg', card.iconBg)}>
                  <Icon className={cn('h-5 w-5', card.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
