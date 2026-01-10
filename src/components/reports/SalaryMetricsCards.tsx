import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, ArrowDown, ArrowUp } from 'lucide-react';
import type { SalaryStats } from '@/hooks/useSalaryAnalytics';

interface SalaryMetricsCardsProps {
  stats: SalaryStats;
  isLoading?: boolean;
}

export function SalaryMetricsCards({ stats, isLoading }: SalaryMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const metrics = [
    {
      label: 'Total Payroll',
      value: formatCurrency(stats.totalPayroll),
      subtext: `${stats.employeeCount} employees`,
      icon: DollarSign,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Average Salary',
      value: formatCurrency(stats.averageSalary),
      subtext: 'per employee',
      icon: TrendingUp,
      iconBg: 'bg-teal-500/10',
      iconColor: 'text-teal-600',
    },
    {
      label: 'Median Salary',
      value: formatCurrency(stats.medianSalary),
      subtext: 'middle value',
      icon: Users,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Salary Range',
      value: formatCurrency(stats.minSalary),
      subtext: `to ${formatCurrency(stats.maxSalary)}`,
      icon: ArrowDown,
      secondIcon: ArrowUp,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.subtext}</p>
              </div>
              <div className={`p-2 rounded-lg ${metric.iconBg}`}>
                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
