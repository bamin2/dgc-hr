import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Standardized notification types
export type NotificationType = 'approval' | 'payroll' | 'document' | 'reminder' | 'announcement' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger';

// Entity types for filtering
export type NotificationEntityType = 
  | 'leave_request' 
  | 'business_trip' 
  | 'loan' 
  | 'payslip' 
  | 'employee_document'
  | 'attendance_correction'
  | 'expense'
  | 'employee'
  | 'general';

// Standardized metadata structure
export interface NotificationMetadata {
  entity_type: NotificationEntityType;
  entity_id: string;
  severity: NotificationSeverity;
  event_key: string;
  extra?: Record<string, unknown>;
  archived?: boolean;
}

// Parameters for creating a notification
export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl: string;
  actorName?: string;
  actorAvatar?: string;
  metadata: NotificationMetadata;
}

// Batch notification params (same notification to multiple users)
export interface BatchNotificationParams {
  userIds: string[];
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl: string;
  actorName?: string;
  actorAvatar?: string;
  metadata: NotificationMetadata;
}

/**
 * Create a single standardized notification
 */
export async function createNotification(params: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  const {
    userId,
    type,
    priority = 'medium',
    title,
    message,
    actionUrl,
    actorName,
    actorAvatar,
    metadata,
  } = params;

  // Validate required metadata fields
  if (!metadata.entity_type || !metadata.entity_id || !metadata.severity || !metadata.event_key) {
    return { 
      success: false, 
      error: 'Missing required metadata fields: entity_type, entity_id, severity, event_key' 
    };
  }

  try {
    const notificationData = {
      user_id: userId,
      type,
      priority,
      title,
      message,
      action_url: actionUrl,
      actor_name: actorName ?? null,
      actor_avatar: actorAvatar ?? null,
      metadata: metadata as unknown as Json,
      is_read: false,
    };
    
    const { error } = await supabase.from('notifications').insert(notificationData);

    if (error) {
      console.error('Failed to create notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Create the same notification for multiple users
 */
export async function createBatchNotifications(params: BatchNotificationParams): Promise<{ success: boolean; count: number; errors: string[] }> {
  const {
    userIds,
    type,
    priority = 'medium',
    title,
    message,
    actionUrl,
    actorName,
    actorAvatar,
    metadata,
  } = params;

  if (!userIds.length) {
    return { success: true, count: 0, errors: [] };
  }

  // Validate required metadata fields
  if (!metadata.entity_type || !metadata.entity_id || !metadata.severity || !metadata.event_key) {
    return { 
      success: false, 
      count: 0,
      errors: ['Missing required metadata fields: entity_type, entity_id, severity, event_key'] 
    };
  }

  const notifications = userIds.map(userId => ({
    user_id: userId,
    type,
    priority,
    title,
    message,
    action_url: actionUrl,
    actor_name: actorName ?? null,
    actor_avatar: actorAvatar ?? null,
    metadata: metadata as unknown as Json,
    is_read: false,
  }));

  try {
    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) {
      console.error('Failed to create batch notifications:', error);
      return { success: false, count: 0, errors: [error.message] };
    }

    return { success: true, count: userIds.length, errors: [] };
  } catch (error) {
    console.error('Failed to create batch notifications:', error);
    return { success: false, count: 0, errors: [String(error)] };
  }
}

/**
 * Archive a notification (soft delete via metadata)
 */
export async function archiveNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First get current metadata
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('metadata')
      .eq('id', notificationId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Update metadata with archived flag
    const updatedMetadata = {
      ...(notification?.metadata as Record<string, unknown> || {}),
      archived: true,
    };

    const { error } = await supabase
      .from('notifications')
      .update({ metadata: updatedMetadata })
      .eq('id', notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Archive multiple notifications
 */
export async function archiveNotifications(notificationIds: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (!notificationIds.length) {
    return { success: true, count: 0 };
  }

  let archivedCount = 0;
  const errors: string[] = [];

  for (const id of notificationIds) {
    const result = await archiveNotification(id);
    if (result.success) {
      archivedCount++;
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  return { 
    success: errors.length === 0, 
    count: archivedCount,
    error: errors.length ? errors.join(', ') : undefined
  };
}

// Pre-defined event keys for consistency
export const EVENT_KEYS = {
  // Leave
  LEAVE_SUBMITTED: 'leave.submitted',
  LEAVE_APPROVED: 'leave.approved',
  LEAVE_REJECTED: 'leave.rejected',
  LEAVE_CANCELLED: 'leave.cancelled',
  
  // Business Trips
  TRIP_SUBMITTED: 'trip.submitted',
  TRIP_MANAGER_APPROVED: 'trip.manager_approved',
  TRIP_APPROVED: 'trip.approved',
  TRIP_REJECTED: 'trip.rejected',
  TRIP_CANCELLED: 'trip.cancelled',
  
  // Payroll
  PAYSLIP_PUBLISHED: 'payslip.published',
  PAYROLL_PROCESSED: 'payroll.processed',
  
  // Documents
  DOCUMENT_EXPIRING_SOON: 'document.expiring_soon',
  DOCUMENT_EXPIRED: 'document.expired',
  DOCUMENT_UPLOADED: 'document.uploaded',
  
  // Loans
  LOAN_APPROVED: 'loan.approved',
  LOAN_REJECTED: 'loan.rejected',
  LOAN_INSTALLMENT_DUE: 'loan.installment_due',
  
  // Attendance
  CORRECTION_SUBMITTED: 'correction.submitted',
  CORRECTION_APPROVED: 'correction.approved',
  CORRECTION_REJECTED: 'correction.rejected',
  
  // Insurance Cards
  INSURANCE_CARD_EXPIRING: 'insurance_card.expiring_soon',
  INSURANCE_CARD_EXPIRED: 'insurance_card.expired',
  
  // System
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_ANNOUNCEMENT: 'system.announcement',
} as const;

export type EventKey = typeof EVENT_KEYS[keyof typeof EVENT_KEYS];
