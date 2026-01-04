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
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: "medium",
    actionUrl: "/payroll"
  },
  {
    id: "4",
    type: "employee",
    title: "New Employee",
    message: "Emily Davis has joined the Design team as Senior UX Designer",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "high"
  },
  {
    id: "6",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight from 2:00 AM - 4:00 AM EST",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "low"
  },
  {
    id: "7",
    type: "leave_request",
    title: "Leave Request",
    message: "Michael Chen requested 1 day of sick leave for tomorrow",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium",
    actionUrl: "/payroll"
  },
  {
    id: "9",
    type: "approval",
    title: "Expense Approved",
    message: "Your expense claim for $450.00 has been approved by Finance",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "low",
    actionUrl: "/benefits"
  },
  {
    id: "10",
    type: "employee",
    title: "Role Change",
    message: "Alex Johnson has been promoted to Engineering Lead",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium",
    actionUrl: "/employees",
    actor: {
      name: "Alex Johnson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: "11",
    type: "reminder",
    title: "Benefits Enrollment",
    message: "Open enrollment period ends in 5 days. Complete your selections.",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "high",
    actionUrl: "/benefits"
  },
  {
    id: "12",
    type: "system",
    title: "Password Expiry",
    message: "Your password will expire in 7 days. Please update it soon.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium"
  },
  {
    id: "13",
    type: "leave_request",
    title: "Leave Request",
    message: "Rachel Green requested 2 weeks of parental leave starting Jan 15",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "high",
    actionUrl: "/attendance",
    actor: {
      name: "Rachel Green",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
    }
  },
  {
    id: "14",
    type: "payroll",
    title: "Tax Forms Ready",
    message: "Your W-2 tax forms are now available for download",
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium",
    actionUrl: "/payroll"
  },
  {
    id: "15",
    type: "employee",
    title: "Team Update",
    message: "Marketing team has been restructured. Check the new org chart.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "low",
    actionUrl: "/employees"
  },
  {
    id: "16",
    type: "approval",
    title: "Time Off Denied",
    message: "Your time off request for Dec 31 was denied due to staffing needs",
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "high",
    actionUrl: "/attendance"
  },
  {
    id: "17",
    type: "reminder",
    title: "Timesheet Reminder",
    message: "Don't forget to submit your timesheet by end of day Friday",
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium"
  },
  {
    id: "18",
    type: "system",
    title: "New Feature",
    message: "Check out the new mobile app for easier time tracking on the go",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "low"
  },
  {
    id: "19",
    type: "employee",
    title: "Anniversary",
    message: "Congratulations! Today marks your 3rd year with the company",
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "low"
  },
  {
    id: "20",
    type: "payroll",
    title: "Direct Deposit Updated",
    message: "Your direct deposit information has been successfully updated",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: "medium",
    actionUrl: "/payroll"
  }
];
