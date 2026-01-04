import { formatDistanceToNow, format } from 'date-fns';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NotificationTypeBadge } from './NotificationTypeBadge';
import type { Notification } from '@/data/notifications';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const navigate = useNavigate();
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
  const formattedDate = format(new Date(notification.timestamp), 'MMM d, yyyy h:mm a');

  const priorityColors = {
    high: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10',
    medium: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
    low: 'border-l-gray-300 dark:border-l-gray-600'
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  };

  const handleView = () => {
    if (notification.actionUrl) {
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
      navigate(notification.actionUrl);
    }
  };

  return (
    <Card 
      className={cn(
        'border-l-4 transition-all hover:shadow-md',
        priorityColors[notification.priority],
        !notification.isRead && 'ring-1 ring-primary/20'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar or Type Badge */}
          <div className="flex-shrink-0">
            {notification.actor ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={notification.actor.avatar} alt={notification.actor.name} />
                <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <NotificationTypeBadge type={notification.type} size="lg" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn(
                  'font-medium',
                  !notification.isRead && 'font-semibold'
                )}>
                  {notification.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {notification.type.replace('_', ' ')}
                </Badge>
                <Badge className={cn('text-xs', priorityBadgeColors[notification.priority])}>
                  {notification.priority}
                </Badge>
                {!notification.isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span title={formattedDate}>{timeAgo}</span>
                <span className="mx-2">•</span>
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-8 px-2 text-xs"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Mark read
                  </Button>
                )}
                {notification.actionUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleView}
                    className="h-8 px-2 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                  className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};