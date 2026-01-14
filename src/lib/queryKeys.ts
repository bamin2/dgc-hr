/**
 * Centralized query key factory for consistent cache management
 * Usage: queryKey: queryKeys.employees.all
 */
export const queryKeys = {
  // Employee queries
  employees: {
    all: ['employees'] as const,
    detail: (id: string) => ['employees', id] as const,
    byDepartment: (deptId: string) => ['employees', 'department', deptId] as const,
    byManager: (managerId: string) => ['employees', 'manager', managerId] as const,
    former: ['former-employees'] as const,
  },
  
  // Team member queries (alias for employees with different UI mapping)
  teamMembers: {
    all: ['team-members'] as const,
    detail: (id: string) => ['team-members', id] as const,
  },
  
  // Department queries
  departments: {
    all: ['departments'] as const,
    detail: (id: string) => ['departments', id] as const,
  },
  
  // Position queries
  positions: {
    all: ['positions'] as const,
    detail: (id: string) => ['positions', id] as const,
    byDepartment: (deptId: string) => ['positions', 'department', deptId] as const,
  },
  
  // Leave queries
  leave: {
    requests: {
      all: ['leave-requests'] as const,
      byStatus: (status: string) => ['leave-requests', { status }] as const,
      byEmployee: (employeeId: string) => ['leave-requests', 'employee', employeeId] as const,
      pending: ['leave-requests', 'pending'] as const,
    },
    types: ['leave-types'] as const,
    balances: {
      all: ['leave-balances'] as const,
      byEmployee: (employeeId: string) => ['leave-balances', employeeId] as const,
      adjustments: ['leave-balance-adjustments'] as const,
    },
  },
  
  // Payroll queries
  payroll: {
    runs: {
      all: ['payroll-runs'] as const,
      detail: (id: string) => ['payroll-runs', id] as const,
      byLocation: (locationId: string) => ['payroll-runs', 'location', locationId] as const,
      byLocationV2: (locationId: string) => ['payroll-runs-v2', locationId] as const,
      single: (runId: string) => ['payroll-run', runId] as const,
      employees: (runId: string) => ['payroll-run-employees', runId] as const,
      adjustments: (runId: string) => ['payroll-run-adjustments', runId] as const,
    },
    draftCounts: ['payroll-draft-counts'] as const,
    draftCheck: (locationId: string, periodStart: string, periodEnd: string) => 
      ['payroll-draft-check', locationId, periodStart, periodEnd] as const,
    dashboard: ['payroll-dashboard'] as const,
    dashboardRuns: ['payroll-dashboard-runs'] as const,
  },
  
  // Dashboard queries
  dashboard: {
    admin: ['admin-dashboard'] as const,
    team: (teamMemberIds: string[]) => ['team-dashboard', teamMemberIds] as const,
    personal: ['personal-dashboard'] as const,
    metrics: ['dashboard-metrics'] as const,
  },
  
  // Loan queries
  loans: {
    all: ['loans'] as const,
    detail: (id: string) => ['loan', id] as const,
    byEmployee: (employeeId: string) => ['loans', 'employee', employeeId] as const,
    withInstallments: (employeeId: string) => ['employee-loans-with-installments', employeeId] as const,
    my: (userId: string) => ['my-loans', userId] as const,
    installments: (loanId: string) => ['loan-installments', loanId] as const,
    installmentsDue: ['loan-installments-due'] as const,
    installmentsDueForPayroll: (start: string, end: string, employeeIds: string[]) => 
      ['loan-installments-due', start, end, employeeIds] as const,
    withFilters: (filters?: { status?: string; employeeId?: string }) => ['loans', filters] as const,
  },
  
  // Document queries
  documents: {
    templates: ['document-templates'] as const,
    templateDetail: (id: string) => ['document-templates', id] as const,
    requestableTemplates: ['document-templates', 'requestable'] as const,
    types: ['document-types'] as const,
    byEmployee: (employeeId: string) => ['employee-documents', employeeId] as const,
  },
  
  // Attendance queries
  attendance: {
    records: {
      all: ['attendance-records'] as const,
      byEmployee: (employeeId: string) => ['attendance-records', employeeId] as const,
      byDate: (date: string) => ['attendance-records', 'date', date] as const,
      withFilters: (filters: Record<string, unknown>) => ['attendance-records', filters] as const,
    },
    summary: (date: string) => ['attendance-summary', date] as const,
    corrections: {
      all: ['attendance-corrections'] as const,
      withFilters: (filters: Record<string, unknown>) => ['attendance-corrections', filters] as const,
    },
  },
  
  // Benefits queries
  benefits: {
    plans: {
      all: ['benefit-plans'] as const,
      byStatus: (status: string) => ['benefit-plans', status] as const,
      detail: (id: string) => ['benefit-plan', id] as const,
    },
    enrollments: {
      all: ['benefit-enrollments'] as const,
      byEmployee: (employeeId: string) => ['benefit-enrollments', employeeId] as const,
    },
    claims: ['benefit-claims'] as const,
    metrics: ['benefits-metrics'] as const,
  },
  
  // Employee compensation queries
  compensation: {
    allowances: {
      byEmployee: (employeeId: string) => ['employee-allowances', employeeId] as const,
    },
    deductions: {
      byEmployee: (employeeId: string) => ['employee-deductions', employeeId] as const,
    },
    salaryHistory: (employeeId: string) => ['salary-history', employeeId] as const,
  },
  
  // Approvals queries
  approvals: {
    pending: ['pending-approvals'] as const,
    pendingCount: ['pending-approvals-count'] as const,
    steps: (requestId: string, requestType: string) => ['request-approval-steps', requestId, requestType] as const,
    myRequests: ['my-requests'] as const,
    teamRequests: ['team-requests'] as const,
  },
  
  // Company/Settings queries
  company: {
    settings: ['company-settings'] as const,
    workLocations: ['work-locations'] as const,
    banks: ['banks'] as const,
  },
  
  // Templates queries
  templates: {
    allowance: {
      all: ['allowance-templates'] as const,
      active: ['allowance-templates', 'active'] as const,
      byLocation: (locationId: string) => ['allowance-templates', 'location', locationId] as const,
      activeByLocation: (locationId: string) => ['allowance-templates', 'active', 'location', locationId] as const,
    },
    deduction: {
      all: ['deduction-templates'] as const,
      active: ['deduction-templates', 'active'] as const,
      byLocation: (locationId: string) => ['deduction-templates', 'location', locationId] as const,
      activeByLocation: (locationId: string) => ['deduction-templates', 'active', 'location', locationId] as const,
    },
  },
  
  // Onboarding/Offboarding queries
  workflows: {
    onboarding: {
      all: ['onboarding-records'] as const,
      templates: ['onboarding-workflows'] as const,
      detail: (id: string) => ['onboarding-record', id] as const,
      byEmployee: (employeeId: string) => ['onboarding', employeeId] as const,
    },
    offboarding: {
      all: ['offboarding-records'] as const,
      detail: (id: string) => ['offboarding-record', id] as const,
      byEmployee: (employeeId: string) => ['offboarding', employeeId] as const,
    },
  },
  
  // Calendar/Events queries
  calendar: {
    events: ['calendar-events'] as const,
    byDateRange: (start: string, end: string) => ['calendar-events', start, end] as const,
  },
  
  // Audit/History queries
  audit: {
    logs: ['audit-logs'] as const,
    byEntity: (entityType: string, entityId: string) => ['audit-logs', entityType, entityId] as const,
    salaryHistory: (employeeId: string) => ['salary-history', employeeId] as const,
  },
  
  // Reports queries
  reports: {
    dashboardStats: ['report-dashboard-stats'] as const,
    attendance: ['report-attendance-data'] as const,
    payroll: ['report-payroll-data'] as const,
    department: ['report-department-stats'] as const,
    leave: ['report-leave-data'] as const,
  },
  
  // Analytics queries
  analytics: {
    salary: ['salary-analytics'] as const,
  },
  
  // Smart tags queries
  smartTags: {
    all: ['smart-tags'] as const,
    active: ['smart-tags', 'active'] as const,
  },
  
  // Role/Permission queries
  roles: {
    currentUser: (userId: string) => ['current-user-role', userId] as const,
    allUserRoles: ['all-user-roles'] as const,
    teamMembers: (employeeId: string) => ['team-members', employeeId] as const,
  },
  
  // Notifications queries
  notifications: {
    all: ['notifications'] as const,
    byUser: (userId: string) => ['notifications', userId] as const,
    unread: ['notifications', 'unread'] as const,
    unreadCount: (userId: string) => ['notifications-unread-count', userId] as const,
  },
  
  // Approval workflows
  approvalWorkflows: {
    all: ['approval-workflows'] as const,
    byType: (requestType: string) => ['approval-workflow', requestType] as const,
  },
  
  // Users for approvals
  users: {
    hr: ['hr-users'] as const,
    all: ['all-users-for-approvals'] as const,
    sessions: {
      all: ['user-sessions'] as const,
      byUser: (userId: string) => ['user-sessions', userId] as const,
    },
  },
  
  // Public holidays
  publicHolidays: {
    byYear: (year: number) => ['public-holidays', year] as const,
  },
  
  // Organizations
  organizations: {
    departments: ['departments-management'] as const,
    positions: ['positions-management'] as const,
  },
  
  // Business Trips queries
  businessTrips: {
    my: ['business-trips', 'my'] as const,
    all: (filters?: Record<string, unknown>) => ['business-trips', 'all', filters] as const,
    detail: (id: string) => ['business-trips', id] as const,
    teamApprovals: ['business-trips', 'team-approvals'] as const,
    hrApprovals: ['business-trips', 'hr-approvals'] as const,
    pendingApprovals: (isHROrAdmin: boolean) => ['business-trips', 'pending-approvals', isHROrAdmin] as const,
    destinations: ['business-trip-destinations'] as const,
    allDestinations: ['business-trip-destinations', 'all'] as const,
    expenses: (tripId: string) => ['business-trip-expenses', tripId] as const,
    amendments: (tripId: string) => ['business-trip-amendments', tripId] as const,
    attachments: (tripId: string) => ['business-trip-attachments', tripId] as const,
    settings: ['business-trip-settings'] as const,
  },
} as const;

// Type helpers for query key types
export type QueryKeys = typeof queryKeys;
