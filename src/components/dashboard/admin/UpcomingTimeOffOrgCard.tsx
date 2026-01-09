import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarRange, User } from 'lucide-react';
import { format } from 'date-fns';

interface TimeOffData {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  daysCount: number;
}

interface UpcomingTimeOffOrgCardProps {
  upcomingTimeOff: TimeOffData[];
  isLoading?: boolean;
}

export function UpcomingTimeOffOrgCard({ upcomingTimeOff, isLoading }: UpcomingTimeOffOrgCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-primary" />
          Upcoming Time Off
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingTimeOff.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming time off scheduled
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingTimeOff.slice(0, 5).map((item, idx) => (
              <div 
                key={`${item.employeeId}-${idx}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-muted p-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.startDate), 'MMM d')}
                      {item.startDate !== item.endDate && (
                        <> - {format(new Date(item.endDate), 'MMM d')}</>
                      )}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.daysCount}d
                </Badge>
              </div>
            ))}
            
            {upcomingTimeOff.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{upcomingTimeOff.length - 5} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
