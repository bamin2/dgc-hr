import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/lib/queryKeys';
import type { NotificationMetadata, NotificationEntityType } from '@/lib/notificationService';

// Standardized notification types matching DB schema
export type NotificationType = 'approval' | 'payroll' | 'document' | 'reminder' | 'announcement' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  is_read: boolean;
  action_url: string | null;
  actor_name: string | null;
  actor_avatar: string | null;
  metadata: NotificationMetadata | Record<string, unknown>;
  created_at: string;
}

// Transformed type for component compatibility
export interface NotificationDisplay {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  actor?: {
    name: string;
    avatar: string;
  };
  metadata?: NotificationMetadata | Record<string, unknown>;
  entityType?: NotificationEntityType;
  severity?: 'info' | 'success' | 'warning' | 'danger';
  eventKey?: string;
  archived?: boolean;
}

function transformToDisplay(notification: Notification): NotificationDisplay {
  const metadata = notification.metadata as NotificationMetadata | undefined;
  
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    timestamp: notification.created_at,
    isRead: notification.is_read,
    priority: notification.priority,
    actionUrl: notification.action_url || undefined,
    actor: notification.actor_name ? {
      name: notification.actor_name,
      avatar: notification.actor_avatar || '',
    } : undefined,
    metadata: notification.metadata,
    entityType: metadata?.entity_type,
    severity: metadata?.severity,
    eventKey: metadata?.event_key,
    archived: metadata?.archived,
  };
}

export interface NotificationFilters {
  type?: NotificationType | 'all';
  entityType?: NotificationEntityType | 'all';
  status?: 'all' | 'read' | 'unread';
  priority?: NotificationPriority | 'all';
  includeArchived?: boolean;
}

export function useNotifications(filters?: NotificationFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: user?.id ? queryKeys.notifications.byUser(user.id) : queryKeys.notifications.all,
    staleTime: 1000 * 60, // 1 minute
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, message, priority, is_read, action_url, actor_name, actor_avatar, metadata, created_at')
        .eq('user_id', user.id)
        .order('is_read', { ascending: true }) // Unread first
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      let notifications = (data as unknown as Notification[]).map(transformToDisplay);
      
      // Filter out archived by default
      if (!filters?.includeArchived) {
        notifications = notifications.filter(n => !n.archived);
      }

      return notifications;
    },
    enabled: !!user?.id,
    retry: 0,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(user.id) });
      }
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(user.id) });
      }
    },
  });

  const markSelectedAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (!user?.id || !notificationIds.length) throw new Error('No user or notifications');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(user.id) });
      }
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(user.id) });
      }
    },
  });

  const deleteReadNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(user.id) });
      }
    },
  });

  const archiveNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Get current metadata
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('metadata')
        .eq('id', notificationId)
        .single();

      if (fetchError) throw fetchError;

      // Update with archived flag
      const updatedMetadata = {
        ...(notification?.metadata as Record<string, unknown> || {}),
        archived: true,
      };

      const { error } = await supabase
        .from('notifications')
        .update({ metadata: updatedMetadata })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.byUser(user.id) });
      }
    },
  });

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    markSelectedAsRead: markSelectedAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    deleteReadNotifications: deleteReadNotificationsMutation.mutateAsync,
    archiveNotification: archiveNotificationMutation.mutateAsync,
  };
}

// Separate hook for unread count (useful for header bell)
export function useUnreadNotificationsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: user?.id ? queryKeys.notifications.unreadCount(user.id) : queryKeys.notifications.unread,
    staleTime: 1000 * 60, // 1 minute
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    retry: 0,
  });
}
