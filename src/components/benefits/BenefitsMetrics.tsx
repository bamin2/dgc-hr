import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, FileText, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BenefitsMetrics as BenefitsMetricsType } from '@/hooks/useBenefitsMetrics';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';

interface BenefitsMetricsProps {
  metrics: BenefitsMetricsType;
}

export const BenefitsMetrics = ({ metrics }: BenefitsMetricsProps) => {
  const { formatCurrency } = useCompanySettings();

  const cards = [
    {
      title: 'Total Plans',
      value: metrics.totalPlans.toString(),
      subtitle: 'Active benefit plans',
      icon: Heart,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Active Enrollments',
      value: metrics.activeEnrollments.toString(),
      subtitle: `${metrics.enrollmentRate}% enrollment rate`,
      icon: Users,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Pending Claims',
      value: metrics.pendingClaims.toString(),
      subtitle: 'Awaiting processing',
      icon: FileText,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Monthly Cost',
      value: formatCurrency(metrics.monthlyBenefitsCost),
      subtitle: 'Total contributions',
      icon: DollarSign,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
