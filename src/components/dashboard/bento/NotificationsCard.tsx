import { Link } from "react-router-dom";
import { Bell, ArrowRight, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoCard } from "./BentoCard";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { NotificationTypeBadge } from "@/components/notifications/NotificationTypeBadge";

interface NotificationsCardProps {
  /** Compact variant for mobile - shows items with larger touch targets */
  variant?: "default" | "compact";
  /** Number of items to display (default: 3 for default, 4 for compact) */
  itemCount?: number;
}

export function NotificationsCard({ variant = "default", itemCount }: NotificationsCardProps) {
  const { notifications, isLoading } = useNotifications();
  const isCompact = variant === "compact";

  // Get notifications based on variant and itemCount prop
  const defaultCount = isCompact ? 4 : 3;
  const displayCount = itemCount ?? defaultCount;
  const displayNotifications = notifications.slice(0, displayCount);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <BentoCard colSpan={isCompact ? 12 : 5}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(displayCount)].map((_, i) => (
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

  // Compact mobile variant
  if (isCompact) {
    return (
      <BentoCard colSpan={12} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="space-y-2">
          {displayNotifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              No notifications
            </p>
          ) : (
            displayNotifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.actionUrl || "/notifications"}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  "hover:bg-secondary/50 active:bg-secondary/70 transition-colors",
                  "touch-manipulation min-h-[56px]",
                  !notification.isRead && "bg-primary/5"
                )}
              >
                <NotificationTypeBadge 
                  type={notification.type} 
                  entityType={notification.entityType}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </Link>
            ))
          )}
        </div>

        {notifications.length > displayCount && (
          <Link 
            to="/notifications" 
            className="flex items-center justify-center gap-1 text-sm text-primary font-medium mt-3 py-2 touch-manipulation"
          >
            View all notifications
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </BentoCard>
    );
  }

  // Default desktop variant
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
