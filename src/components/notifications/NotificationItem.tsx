import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NotificationTypeBadge } from "./NotificationTypeBadge";
import type { NotificationDisplay } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: NotificationDisplay;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5"
      )}
    >
      {notification.actor ? (
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {notification.actor.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      ) : (
        <NotificationTypeBadge type={notification.type} />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium truncate",
            !notification.isRead ? "text-foreground" : "text-muted-foreground"
          )}>
            {notification.title}
          </span>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <span className="text-xs text-muted-foreground/70 mt-1 block">
          {timeAgo}
        </span>
      </div>
    </button>
  );
}
