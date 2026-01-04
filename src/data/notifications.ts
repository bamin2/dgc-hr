export interface NotificationActor {
  name: string;
  avatar: string;
}

export interface Notification {
  id: string;
  type: 'leave_request' | 'approval' | 'payroll' | 'employee' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actor?: NotificationActor;
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "leave_request",
    title: "Leave Request",
    message: "John Smith requested 3 days of vacation leave for Dec 20-22",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    isRead: false,
    priority: "high",
    actionUrl: "/attendance",
    actor: {
      name: "John Smith",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: "2",
    type: "approval",
    title: "Leave Approved",
    message: "Your vacation request for Dec 25-27 has been approved by Sarah Wilson",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    isRead: false,
    priority: "medium",
    actionUrl: "/attendance",
    actor: {
      name: "Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: "3",
    type: "payroll",
    title: "Payroll Processed",
    message: "December 2024 payroll has been processed successfully for 156 employees",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    priority: "medium",
    actionUrl: "/payroll"
  },
  {
    id: "4",
    type: "employee",
    title: "New Employee",
    message: "Emily Davis has joined the Design team as Senior UX Designer",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    isRead: true,
    priority: "low",
    actionUrl: "/employees",
    actor: {
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: "5",
    type: "reminder",
    title: "Performance Reviews",
    message: "Q4 performance reviews are due in 3 days. 12 reviews pending.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    isRead: true,
    priority: "high"
  },
  {
    id: "6",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight from 2:00 AM - 4:00 AM EST",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    priority: "low"
  },
  {
    id: "7",
    type: "leave_request",
    title: "Leave Request",
    message: "Michael Chen requested 1 day of sick leave for tomorrow",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
    isRead: true,
    priority: "medium",
    actionUrl: "/attendance",
    actor: {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: "8",
    type: "payroll",
    title: "Bonus Approved",
    message: "Year-end bonuses have been approved and will be included in December payroll",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
    priority: "medium",
    actionUrl: "/payroll"
  }
];
