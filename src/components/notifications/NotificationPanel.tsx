import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "./NotificationItem";
import { Link } from "react-router-dom";
import type { NotificationDisplay } from "@/hooks/useNotifications";

interface NotificationPanelProps {
  notifications: NotificationDisplay[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState("all");
  
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const displayNotifications = activeTab === "unread" ? unreadNotifications : notifications;
  const unreadCount = unreadNotifications.length;

  return (
    <div className="w-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs text-muted-foreground hover:text-foreground h-auto py-1 px-2"
          >
            <Check className="w-3 h-3 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <NotificationList
              notifications={displayNotifications}
              onMarkAsRead={onMarkAsRead}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <NotificationList
              notifications={displayNotifications}
              onMarkAsRead={onMarkAsRead}
              emptyMessage="No unread notifications"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <Link 
          to="/notifications" 
          className="text-sm text-primary hover:underline flex items-center justify-center"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}

interface NotificationListProps {
  notifications: NotificationDisplay[];
  onMarkAsRead: (id: string) => void;
  emptyMessage?: string;
}

function NotificationList({ notifications, onMarkAsRead, emptyMessage = "No notifications" }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Bell className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[360px]">
      <div className="divide-y divide-border">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
