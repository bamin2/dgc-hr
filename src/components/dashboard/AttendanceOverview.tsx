import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTodayAttendance } from "@/hooks/useDashboardMetrics";
import { format, parseISO } from "date-fns";

const statusStyles = {
  present: "bg-success/10 text-success border-success/20",
  late: "bg-warning/10 text-warning border-warning/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
  remote: "bg-info/10 text-info border-info/20",
};

const statusLabels = {
  present: "On Time",
  late: "Late",
  absent: "Absent",
  remote: "Remote",
};

export function AttendanceOverview() {
  const { data, isLoading } = useTodayAttendance(5);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const records = data?.records || [];
  const presentCount = data?.presentCount || 0;
  const absentCount = data?.absentCount || 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Attendance Overview
          </h3>
          <p className="text-sm text-muted-foreground">Today's check-ins</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">{presentCount} Present</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">{absentCount} Absent</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {records.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No attendance records for today
          </p>
        ) : (
          records.map((record) => {
            const checkInTime = record.check_in 
              ? format(parseISO(record.check_in), 'hh:mm a')
              : '--:--';
            const status = record.status as keyof typeof statusStyles;
            
            return (
              <div
                key={record.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={record.employee?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {record.employee?.first_name?.[0] || ''}
                      {record.employee?.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {record.employee?.first_name} {record.employee?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Check-in: {checkInTime}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    statusStyles[status] || statusStyles.present
                  )}
                >
                  {statusLabels[status] || status}
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
