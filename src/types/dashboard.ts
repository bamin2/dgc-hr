// Dashboard section and card configuration types

export type DashboardSection = 'personal' | 'team' | 'admin';
export type DataScope = 'self' | 'team' | 'organization';

export interface DashboardCardConfig {
  id: string;
  section: DashboardSection;
  dataScope: DataScope;
  label: string;
  description: string;
  enabled: boolean;
  order: number;
}

export interface SectionedDashboardConfig {
  personal: DashboardCardConfig[];
  team: DashboardCardConfig[];
  admin: DashboardCardConfig[];
}

// Card registry with default configurations
export const dashboardCardRegistry: Record<string, Omit<DashboardCardConfig, 'enabled' | 'order'>> = {
  // Personal Section Cards
  myLeaveBalance: {
    id: 'myLeaveBalance',
    section: 'personal',
    dataScope: 'self',
    label: 'My Leave Balance',
    description: 'Annual & sick leave remaining',
  },
  nextPayroll: {
    id: 'nextPayroll',
    section: 'personal',
    dataScope: 'self',
    label: 'Next Payroll',
    description: 'Next payroll date and last salary',
  },
  myRequests: {
    id: 'myRequests',
    section: 'personal',
    dataScope: 'self',
    label: 'My Requests',
    description: 'Pending, approved, and rejected counts',
  },
  myLoans: {
    id: 'myLoans',
    section: 'personal',
    dataScope: 'self',
    label: 'My Loans',
    description: 'Outstanding balance and next installment',
  },
  myUpcomingTimeOff: {
    id: 'myUpcomingTimeOff',
    section: 'personal',
    dataScope: 'self',
    label: 'My Upcoming Time Off',
    description: 'Approved upcoming leave',
  },
  myCalendar: {
    id: 'myCalendar',
    section: 'personal',
    dataScope: 'self',
    label: 'My Calendar',
    description: 'Time off, holidays, and payroll dates',
  },
  announcements: {
    id: 'announcements',
    section: 'personal',
    dataScope: 'self',
    label: 'Announcements',
    description: 'Company and department announcements',
  },
  personalQuickActions: {
    id: 'personalQuickActions',
    section: 'personal',
    dataScope: 'self',
    label: 'Quick Actions',
    description: 'Request time off, loans, and HR letters',
  },

  // Team Section Cards
  teamOverview: {
    id: 'teamOverview',
    section: 'team',
    dataScope: 'team',
    label: 'My Team Overview',
    description: 'Number of direct reports',
  },
  teamTimeOff: {
    id: 'teamTimeOff',
    section: 'team',
    dataScope: 'team',
    label: 'Team Time Off',
    description: 'Upcoming approved leaves for direct reports',
  },
  pendingApprovals: {
    id: 'pendingApprovals',
    section: 'team',
    dataScope: 'team',
    label: 'Pending Approvals',
    description: 'Time off requests awaiting approval',
  },

  // Admin Section Cards
  orgOverview: {
    id: 'orgOverview',
    section: 'admin',
    dataScope: 'organization',
    label: 'Organization Overview',
    description: 'Total employees (active/inactive)',
  },
  payrollStatus: {
    id: 'payrollStatus',
    section: 'admin',
    dataScope: 'organization',
    label: 'Payroll Status',
    description: 'Last run, next date, status',
  },
  allPendingApprovals: {
    id: 'allPendingApprovals',
    section: 'admin',
    dataScope: 'organization',
    label: 'All Pending Approvals',
    description: 'Time off, loans, HR letters',
  },
  upcomingTimeOffOrg: {
    id: 'upcomingTimeOffOrg',
    section: 'admin',
    dataScope: 'organization',
    label: 'Upcoming Time Off',
    description: 'Employees on leave this month',
  },
  loanExposure: {
    id: 'loanExposure',
    section: 'admin',
    dataScope: 'organization',
    label: 'Loan Exposure',
    description: 'Total outstanding loans',
  },
  leaveTrends: {
    id: 'leaveTrends',
    section: 'admin',
    dataScope: 'organization',
    label: 'Leave Trends',
    description: 'This month vs last comparison',
  },
  adminQuickActions: {
    id: 'adminQuickActions',
    section: 'admin',
    dataScope: 'organization',
    label: 'Admin Quick Actions',
    description: 'Run payroll, add employee, etc.',
  },
};

// Default configurations for each section
export const defaultDashboardConfig: SectionedDashboardConfig = {
  personal: [
    { ...dashboardCardRegistry.myLeaveBalance, enabled: true, order: 0 },
    { ...dashboardCardRegistry.nextPayroll, enabled: true, order: 1 },
    { ...dashboardCardRegistry.myRequests, enabled: true, order: 2 },
    { ...dashboardCardRegistry.myLoans, enabled: true, order: 3 },
    { ...dashboardCardRegistry.myUpcomingTimeOff, enabled: true, order: 4 },
    { ...dashboardCardRegistry.myCalendar, enabled: true, order: 5 },
    { ...dashboardCardRegistry.announcements, enabled: true, order: 6 },
    { ...dashboardCardRegistry.personalQuickActions, enabled: true, order: 7 },
  ],
  team: [
    { ...dashboardCardRegistry.teamOverview, enabled: true, order: 0 },
    { ...dashboardCardRegistry.teamTimeOff, enabled: true, order: 1 },
    { ...dashboardCardRegistry.pendingApprovals, enabled: true, order: 2 },
  ],
  admin: [
    { ...dashboardCardRegistry.orgOverview, enabled: true, order: 0 },
    { ...dashboardCardRegistry.payrollStatus, enabled: true, order: 1 },
    { ...dashboardCardRegistry.allPendingApprovals, enabled: true, order: 2 },
    { ...dashboardCardRegistry.upcomingTimeOffOrg, enabled: true, order: 3 },
    { ...dashboardCardRegistry.loanExposure, enabled: true, order: 4 },
    { ...dashboardCardRegistry.leaveTrends, enabled: true, order: 5 },
    { ...dashboardCardRegistry.adminQuickActions, enabled: true, order: 6 },
  ],
};
