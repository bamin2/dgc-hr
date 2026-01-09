import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Palmtree, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TimeOffData {
  id: string;
  startDate: string;
  endDate: string;
  leaveTypeName: string;
  daysCount: number;
  reason?: string | null;
}

interface MyUpcomingTimeOffCardProps {
  timeOff: TimeOffData[];
  isLoading?: boolean;
}

export function MyUpcomingTimeOffCard({ timeOff, isLoading }: MyUpcomingTimeOffCardProps) {
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Palmtree className="h-4 w-4 text-primary" />
          Upcoming Time Off
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeOff.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming time off</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeOff.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between border-l-2 border-primary pl-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">
                    {format(new Date(item.startDate), 'MMM d')}
                    {item.startDate !== item.endDate && (
                      <> - {format(new Date(item.endDate), 'MMM d')}</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.leaveTypeName}
                    {item.reason && `: ${item.reason}`}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                  {item.daysCount} day{item.daysCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
