import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, User } from 'lucide-react';
import { format } from 'date-fns';

interface TeamTimeOffData {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveTypeName: string;
  daysCount: number;
}

interface TeamTimeOffCardProps {
  upcomingTimeOff: TeamTimeOffData[];
  isLoading?: boolean;
}

export function TeamTimeOffCard({ upcomingTimeOff, isLoading }: TeamTimeOffCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
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
          <CalendarCheck className="h-4 w-4 text-primary" />
          Team Time Off
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingTimeOff.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming time off for your team
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
