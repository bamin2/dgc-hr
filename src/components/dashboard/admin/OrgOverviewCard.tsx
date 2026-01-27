import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, UserCheck, UserMinus } from 'lucide-react';

interface OrgStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
}

interface OrgOverviewCardProps {
  stats: OrgStats;
  isLoading?: boolean;
}

export function OrgOverviewCard({ stats, isLoading }: OrgOverviewCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const items = [
    { 
      label: 'Total', 
      value: stats.totalEmployees, 
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      label: 'Active', 
      value: stats.activeEmployees, 
      icon: UserCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'On Leave', 
      value: stats.onLeaveEmployees, 
      icon: UserMinus,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Organization Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.label} 
                className={`rounded-lg p-3 text-center ${item.bgColor}`}
              >
                <Icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} />
                <p className="text-lg sm:text-xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
