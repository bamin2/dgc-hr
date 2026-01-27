import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

interface RequestsSummary {
  pending: number;
  approved: number;
  rejected: number;
}

interface MyRequestsCardProps {
  summary: RequestsSummary;
  isLoading?: boolean;
}

export function MyRequestsCard({ summary, isLoading }: MyRequestsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const items = [
    { 
      label: 'Pending', 
      count: summary.pending, 
      icon: Clock, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
    { 
      label: 'Approved', 
      count: summary.approved, 
      icon: CheckCircle, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Rejected', 
      count: summary.rejected, 
      icon: XCircle, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          My Requests
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
                <p className="text-lg sm:text-xl font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
