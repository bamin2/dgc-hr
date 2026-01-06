import { Megaphone, Bell, Calendar, AlertCircle, Users, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  leave_request: Calendar,
  approval: Bell,
  payroll: FileText,
  employee: Users,
  system: AlertCircle,
  reminder: Bell,
  mention: Megaphone,
};

const iconColors = {
  leave_request: "bg-info/10 text-info",
  approval: "bg-success/10 text-success",
  payroll: "bg-warning/10 text-warning",
  employee: "bg-primary/10 text-primary",
  system: "bg-destructive/10 text-destructive",
  reminder: "bg-warning/10 text-warning",
  mention: "bg-primary/10 text-primary",
};

export function Announcements() {
  const { notifications, isLoading } = useNotifications();

  // Get the 3 most recent unread or all notifications
  const displayNotifications = notifications.slice(0, 3);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Announcements
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} new` : 'All read'}
        </span>
      </div>

      <div className="space-y-4">
        {displayNotifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No announcements
          </p>
        ) : (
          displayNotifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell;
            const colorClass = iconColors[notification.type] || iconColors.system;
            
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer",
                  !notification.isRead && "bg-primary/5"
                )}
              >
                <div className={cn("p-2.5 rounded-lg shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground mb-0.5">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
