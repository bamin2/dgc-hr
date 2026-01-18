import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Trash2, Bell, Loader2, Archive } from 'lucide-react';
import {
  NotificationsFilters,
  NotificationsMetrics,
  NotificationCard
} from '@/components/notifications';
import { useNotifications, type NotificationDisplay } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

type NotificationType = NotificationDisplay['type'];
type NotificationPriority = NotificationDisplay['priority'];

// Tab definitions with entity_type filtering
const TABS = [
  { id: 'all', label: 'All', filter: null },
  { id: 'unread', label: 'Unread', filter: 'unread' },
  { id: 'approvals', label: 'Approvals', filter: 'approval' },
  { id: 'payroll', label: 'Payroll', filter: 'payroll' },
  { id: 'documents', label: 'Documents', filter: 'document' },
  { id: 'announcements', label: 'Announcements', filter: 'announcement' },
] as const;

const Notifications = () => {
  const { toast } = useToast();
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteReadNotifications,
    archiveNotification,
  } = useNotifications();
  
  // Active tab
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
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
    highPriority: notifications.filter(n => (n.priority === 'high' || n.priority === 'urgent') && !n.isRead).length
  }), [notifications]);

  // Filter notifications based on active tab and filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Tab filter
      const currentTab = TABS.find(t => t.id === activeTab);
      if (activeTab === 'unread') {
        if (notification.isRead) return false;
      } else if (currentTab?.filter && currentTab.filter !== 'unread') {
        if (notification.type !== currentTab.filter) return false;
      }

      // Search filter
      const matchesSearch = !searchQuery || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter (only apply if on 'all' tab)
      const matchesType = activeTab !== 'all' || typeFilter === 'all' || notification.type === typeFilter;
      
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

      // Hide archived notifications unless explicitly showing
      const isArchived = notification.metadata?.archived === true;
      if (isArchived) return false;

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesDateRange;
    }).sort((a, b) => {
      // Sort: unread first, then by timestamp desc
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [notifications, activeTab, searchQuery, typeFilter, statusFilter, priorityFilter, dateRange]);

  // Selection helpers
  const allSelected = filteredNotifications.length > 0 && 
    filteredNotifications.every(n => selectedIds.has(n.id));
  
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

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

  const handleMarkSelectedAsRead = async () => {
    try {
      const promises = Array.from(selectedIds).map(id => markAsRead(id));
      await Promise.all(promises);
      setSelectedIds(new Set());
      toast({
        title: 'Notifications marked as read',
        description: `${selectedIds.size} notifications marked as read.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read.',
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
      selectedIds.delete(id);
      setSelectedIds(new Set(selectedIds));
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

  const handleArchiveSelected = async () => {
    if (!archiveNotification) return;
    try {
      const promises = Array.from(selectedIds).map(id => archiveNotification(id));
      await Promise.all(promises);
      setSelectedIds(new Set());
      toast({
        title: 'Notifications archived',
        description: `${selectedIds.size} notifications archived.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive notifications.',
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

  // Calculate tab counts
  const tabCounts = useMemo(() => ({
    all: notifications.filter(n => !n.metadata?.archived).length,
    unread: notifications.filter(n => !n.isRead && !n.metadata?.archived).length,
    approvals: notifications.filter(n => n.type === 'approval' && !n.metadata?.archived).length,
    payroll: notifications.filter(n => n.type === 'payroll' && !n.metadata?.archived).length,
    documents: notifications.filter(n => n.type === 'document' && !n.metadata?.archived).length,
    announcements: notifications.filter(n => n.type === 'announcement' && !n.metadata?.archived).length,
  }), [notifications]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Notifications"
          subtitle="View and manage all your notifications"
          actions={
            <div className="flex flex-wrap gap-2">
              {someSelected && (
                <>
                  <Button variant="outline" size="sm" onClick={handleMarkSelectedAsRead}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark selected read ({selectedIds.size})
                  </Button>
                  {archiveNotification && (
                    <Button variant="outline" size="sm" onClick={handleArchiveSelected}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive ({selectedIds.size})
                    </Button>
                  )}
                </>
              )}
              {!someSelected && metrics.unread > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark all read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClearRead}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear read
              </Button>
            </div>
          }
        />

        {/* Metrics */}
        <NotificationsMetrics {...metrics} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1 flex flex-wrap justify-start gap-1 bg-muted/50">
            {TABS.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {tab.label}
                {tabCounts[tab.id as keyof typeof tabCounts] > 0 && (
                  <span className={cn(
                    "ml-1.5 px-1.5 py-0.5 text-xs rounded-full",
                    tab.id === 'unread' 
                      ? "bg-destructive text-destructive-foreground" 
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}>
                    {tabCounts[tab.id as keyof typeof tabCounts]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filters - only show on 'all' tab */}
          {activeTab === 'all' && (
            <div className="mt-4">
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
            </div>
          )}

          {/* Content for all tabs */}
          {TABS.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {/* Select all checkbox */}
              {filteredNotifications.length > 0 && (
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all notifications"
                  />
                  <span className="text-sm text-muted-foreground">
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </span>
                </div>
              )}

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
                        : `No ${tab.id === 'all' ? '' : tab.label.toLowerCase() + ' '}notifications match your current filters.`}
                    </p>
                    {notifications.length > 0 && activeTab === 'all' && (
                      <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredNotifications.map(notification => (
                    <div key={notification.id} className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedIds.has(notification.id)}
                        onCheckedChange={() => toggleSelect(notification.id)}
                        className="mt-4"
                        aria-label={`Select notification: ${notification.title}`}
                      />
                      <div className="flex-1 min-w-0">
                        <NotificationCard
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDelete}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Results count */}
        {filteredNotifications.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
