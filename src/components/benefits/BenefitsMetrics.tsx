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
      iconBg: 'bg-info/10',
      iconColor: 'text-info'
    },
    {
      title: 'Active Enrollments',
      value: metrics.activeEnrollments.toString(),
      subtitle: `${metrics.enrollmentRate}% enrollment rate`,
      icon: Users,
      iconBg: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      title: 'Pending Claims',
      value: metrics.pendingClaims.toString(),
      subtitle: 'Awaiting processing',
      icon: FileText,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning'
    },
    {
      title: 'Monthly Cost',
      value: formatCurrency(metrics.monthlyBenefitsCost),
      subtitle: 'Total contributions',
      icon: DollarSign,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground'
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
                <div className="space-y-1 min-w-0 flex-1 mr-3">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className={cn(
                    "font-semibold tracking-tight",
                    card.value.length <= 10 && "text-2xl",
                    card.value.length > 10 && card.value.length <= 14 && "text-lg",
                    card.value.length > 14 && card.value.length <= 18 && "text-base",
                    card.value.length > 18 && "text-sm"
                  )}>{card.value}</p>
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
