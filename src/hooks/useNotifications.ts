import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { queryKeys } from '@/lib/queryKeys';

export interface Notification {
  id: string;
  user_id: string;
  type: 'leave_request' | 'approval' | 'payroll' | 'employee' | 'system' | 'reminder' | 'mention';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_url: string | null;
  actor_name: string | null;
  actor_avatar: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Transformed type for component compatibility
export interface NotificationDisplay {
  id: string;
  type: Notification['type'];
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: Notification['priority'];
  actionUrl?: string;
  actor?: {
    name: string;
    avatar: string;
  };
}

function transformToDisplay(notification: Notification): NotificationDisplay {
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
  };
}

export function useNotifications() {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Notification[]).map(transformToDisplay);
    },
    enabled: !!user?.id,
    retry: 0,  // Don't retry auth-dependent queries
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
      }
    },
  });

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    deleteReadNotifications: deleteReadNotificationsMutation.mutateAsync,
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
    retry: 0,  // Don't retry auth-dependent queries
  });
}
