import { Link } from "react-router-dom";
import { Megaphone, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { NotificationTypeBadge } from "@/components/notifications/NotificationTypeBadge";

export function Announcements() {
  const { notifications, isLoading } = useNotifications();

  // Get the 5 most recent notifications (unread first)
  const displayNotifications = notifications.slice(0, 5);
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
        <div className="space-y-3">
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Notifications
          </h3>
        </div>
        {unreadCount > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="space-y-1">
        {displayNotifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No notifications
          </p>
        ) : (
          displayNotifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.actionUrl || "/notifications"}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors",
                !notification.isRead && "bg-primary/5"
              )}
            >
              <NotificationTypeBadge 
                type={notification.type} 
                entityType={notification.entityType}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <Link 
          to="/notifications" 
          className="flex items-center justify-center gap-1 text-sm text-primary hover:underline mt-4 pt-4 border-t border-border"
        >
          View all notifications
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </Card>
  );
}
