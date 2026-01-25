import { Link } from "react-router-dom";
import { Bell, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoCard } from "./BentoCard";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { NotificationTypeBadge } from "@/components/notifications/NotificationTypeBadge";

export function NotificationsCard() {
  const { notifications, isLoading } = useNotifications();

  // Get the 3 most recent notifications (unread first)
  const displayNotifications = notifications.slice(0, 3);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <BentoCard colSpan={5}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard colSpan={5}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        {unreadCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="space-y-2">
        {displayNotifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">
            No notifications
          </p>
        ) : (
          displayNotifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.actionUrl || "/notifications"}
              className={cn(
                "flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors",
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
          className="flex items-center justify-center gap-1 text-sm text-primary hover:underline mt-4 pt-3 border-t border-border/50"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </BentoCard>
  );
}
