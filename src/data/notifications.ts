import type { NotificationEntityType } from '@/lib/notificationService';

export interface NotificationActor {
  name: string;
  avatar: string;
}

// Standardized notification types
export type NotificationType = 'approval' | 'payroll' | 'document' | 'reminder' | 'announcement' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationMetadata {
  entity_type?: NotificationEntityType;
  entity_id?: string;
  severity?: NotificationSeverity;
  event_key?: string;
  extra?: Record<string, unknown>;
  archived?: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  actor?: NotificationActor;
  metadata?: NotificationMetadata;
}

// Mock notifications for development/testing
export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "approval",
    title: "Leave Request Pending",
    message: "John Smith requested 3 days of vacation leave for Dec 20-22",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    priority: "high",
    actionUrl: "/approvals",
    actor: {
      name: "John Smith",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    metadata: {
      entity_type: "leave_request",
      entity_id: "lr-001",
      severity: "info",
      event_key: "leave.submitted"
    }
  },
  {
    id: "2",
    type: "approval",
    title: "Leave Approved",
    message: "Your vacation request for Dec 25-27 has been approved by Sarah Wilson",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
    priority: "medium",
    actionUrl: "/approvals?tab=my-requests",
    actor: {
      name: "Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
    },
    metadata: {
      entity_type: "leave_request",
      entity_id: "lr-002",
      severity: "success",
      event_key: "leave.approved"
    }
  },
  {
    id: "3",
    type: "payroll",
    title: "Payslip Available",
    message: "Your January 2026 payslip is now available for download",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: "medium",
    actionUrl: "/my-payslips",
    metadata: {
      entity_type: "payslip",
      entity_id: "ps-001",
      severity: "success",
      event_key: "payslip.published",
      extra: { period: "January 2026" }
    }
  },
  {
    id: "4",
    type: "document",
    title: "Document Expiring Soon",
    message: "Your passport will expire in 30 days. Please renew it.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: "high",
    actionUrl: "/my-documents",
    metadata: {
      entity_type: "employee_document",
      entity_id: "doc-001",
      severity: "warning",
      event_key: "document.expiring_soon",
      extra: { document_name: "Passport", days_until: 30 }
    }
  },
  {
    id: "5",
    type: "reminder",
    title: "Performance Reviews Due",
    message: "Q4 performance reviews are due in 3 days. 12 reviews pending.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "high",
    metadata: {
      entity_type: "general",
      entity_id: "reminder-001",
      severity: "warning",
      event_key: "system.reminder"
    }
  },
  {
    id: "6",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight from 2:00 AM - 4:00 AM EST",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "low",
    metadata: {
      entity_type: "general",
      entity_id: "sys-001",
      severity: "info",
      event_key: "system.maintenance"
    }
  },
  {
    id: "7",
    type: "approval",
    title: "Business Trip Pending",
    message: "Michael Chen submitted a business trip request to Dubai",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium",
    actionUrl: "/business-trips",
    actor: {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    metadata: {
      entity_type: "business_trip",
      entity_id: "bt-001",
      severity: "info",
      event_key: "trip.submitted"
    }
  },
  {
    id: "8",
    type: "announcement",
    title: "New Policy Update",
    message: "Updated remote work policy is now in effect. Please review.",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium",
    actionUrl: "/announcements",
    metadata: {
      entity_type: "general",
      entity_id: "ann-001",
      severity: "info",
      event_key: "system.announcement"
    }
  }
];
