import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Bell, Loader2 } from 'lucide-react';
import {
  NotificationsFilters,
  NotificationsMetrics,
  NotificationCard
} from '@/components/notifications';
import { useNotifications, type NotificationDisplay } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay, isToday } from 'date-fns';

type NotificationType = NotificationDisplay['type'];
type NotificationPriority = NotificationDisplay['priority'];

const Notifications = () => {
  const { toast } = useToast();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteReadNotifications 
  } = useNotifications();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Calculate metrics
  const metrics = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    today: notifications.filter(n => isToday(new Date(n.timestamp))).length,
    highPriority: notifications.filter(n => n.priority === 'high' && !n.isRead).length
  }), [notifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Search filter
      const matchesSearch = !searchQuery || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'read' && notification.isRead) ||
        (statusFilter === 'unread' && !notification.isRead);
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
      
      // Date range filter
      const matchesDateRange = !dateRange?.from || 
        isWithinInterval(new Date(notification.timestamp), {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to || dateRange.from)
        });

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesDateRange;
    });
  }, [notifications, searchQuery, typeFilter, statusFilter, priorityFilter, dateRange]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast({
        title: 'Notification marked as read',
        description: 'The notification has been marked as read.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: 'All notifications marked as read',
        description: `${metrics.unread} notifications marked as read.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive'
      });
    }
  };

  const handleClearRead = async () => {
    const readCount = notifications.filter(n => n.isRead).length;
    try {
      await deleteReadNotifications();
      toast({
        title: 'Read notifications cleared',
        description: `${readCount} read notifications removed.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear read notifications.',
        variant: 'destructive'
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateRange(undefined);
  };

  if (isLoading) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground text-sm sm:text-base">View and manage all your notifications</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              {metrics.unread > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark all read
                </Button>
              )}
              <Button variant="outline" onClick={handleClearRead}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear read
              </Button>
            </div>
          </div>

          {/* Metrics */}
          <NotificationsMetrics {...metrics} />

          {/* Filters */}
          <NotificationsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilters={handleClearFilters}
          />

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/30 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">No notifications found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {notifications.length === 0 
                    ? "You're all caught up! No notifications to display."
                    : "No notifications match your current filters. Try adjusting your search criteria."}
                </p>
                {notifications.length > 0 && (
                  <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* Results count */}
          {filteredNotifications.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;