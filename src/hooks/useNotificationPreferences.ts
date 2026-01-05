import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NotificationSettings } from '@/data/settings';

interface DbNotificationPreferences {
  id: string;
  user_id: string;
  email_new_employee: boolean;
  email_leave_submissions: boolean;
  email_leave_approvals: boolean;
  email_payroll_reminders: boolean;
  email_document_expiration: boolean;
  email_system_announcements: boolean;
  email_weekly_summary: boolean;
  push_enabled: boolean;
  push_new_leave_requests: boolean;
  push_urgent_approvals: boolean;
  push_payroll_deadlines: boolean;
  push_system_updates: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  weekend_notifications: boolean;
}

const defaultSettings: NotificationSettings = {
  email: {
    newEmployee: true,
    leaveSubmissions: true,
    leaveApprovals: true,
    payrollReminders: true,
    documentExpiration: true,
    systemAnnouncements: true,
    weeklySummary: false,
  },
  push: {
    enabled: true,
    newLeaveRequests: true,
    urgentApprovals: true,
    payrollDeadlines: true,
    systemUpdates: false,
  },
  schedule: {
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    weekendNotifications: true,
  },
};

function transformFromDb(row: DbNotificationPreferences | null): NotificationSettings {
  if (!row) return defaultSettings;

  return {
    email: {
      newEmployee: row.email_new_employee,
      leaveSubmissions: row.email_leave_submissions,
      leaveApprovals: row.email_leave_approvals,
      payrollReminders: row.email_payroll_reminders,
      documentExpiration: row.email_document_expiration,
      systemAnnouncements: row.email_system_announcements,
      weeklySummary: row.email_weekly_summary,
    },
    push: {
      enabled: row.push_enabled,
      newLeaveRequests: row.push_new_leave_requests,
      urgentApprovals: row.push_urgent_approvals,
      payrollDeadlines: row.push_payroll_deadlines,
      systemUpdates: row.push_system_updates,
    },
    schedule: {
      quietHoursEnabled: row.quiet_hours_enabled,
      quietHoursStart: row.quiet_hours_start,
      quietHoursEnd: row.quiet_hours_end,
      weekendNotifications: row.weekend_notifications,
    },
  };
}

function transformToDb(settings: NotificationSettings, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    email_new_employee: settings.email.newEmployee,
    email_leave_submissions: settings.email.leaveSubmissions,
    email_leave_approvals: settings.email.leaveApprovals,
    email_payroll_reminders: settings.email.payrollReminders,
    email_document_expiration: settings.email.documentExpiration,
    email_system_announcements: settings.email.systemAnnouncements,
    email_weekly_summary: settings.email.weeklySummary,
    push_enabled: settings.push.enabled,
    push_new_leave_requests: settings.push.newLeaveRequests,
    push_urgent_approvals: settings.push.urgentApprovals,
    push_payroll_deadlines: settings.push.payrollDeadlines,
    push_system_updates: settings.push.systemUpdates,
    quiet_hours_enabled: settings.schedule.quietHoursEnabled,
    quiet_hours_start: settings.schedule.quietHoursStart,
    quiet_hours_end: settings.schedule.quietHoursEnd,
    weekend_notifications: settings.schedule.weekendNotifications,
  };
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return transformFromDb(data as DbNotificationPreferences | null);
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      if (!user?.id) throw new Error('No user');

      const dbData = transformToDb(settings, user.id) as {
        user_id: string;
        email_new_employee: boolean;
        email_leave_submissions: boolean;
        email_leave_approvals: boolean;
        email_payroll_reminders: boolean;
        email_document_expiration: boolean;
        email_system_announcements: boolean;
        email_weekly_summary: boolean;
        push_enabled: boolean;
        push_new_leave_requests: boolean;
        push_urgent_approvals: boolean;
        push_payroll_deadlines: boolean;
        push_system_updates: boolean;
        quiet_hours_enabled: boolean;
        quiet_hours_start: string;
        quiet_hours_end: string;
        weekend_notifications: boolean;
      };
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(dbData, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    },
  });

  return {
    settings: query.data || defaultSettings,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}