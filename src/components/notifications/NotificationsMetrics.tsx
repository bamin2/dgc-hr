import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, Calendar, AlertTriangle } from 'lucide-react';

interface NotificationsMetricsProps {
  total: number;
  unread: number;
  today: number;
  highPriority: number;
}

export const NotificationsMetrics = ({ total, unread, today, highPriority }: NotificationsMetricsProps) => {
  const metrics = [
    {
      label: 'Total',
      value: total,
      icon: Bell,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Unread',
      value: unread,
      icon: BellOff,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100 dark:bg-teal-900/30'
    },
    {
      label: 'Today',
      value: today,
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      label: 'High Priority',
      value: highPriority,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};