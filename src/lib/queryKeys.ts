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
    },
  },
  
  // Payroll queries
  payroll: {
    runs: {
      all: ['payroll-runs'] as const,
      detail: (id: string) => ['payroll-runs', id] as const,
      byLocation: (locationId: string) => ['payroll-runs', 'location', locationId] as const,
    },
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
    detail: (id: string) => ['loans', id] as const,
    byEmployee: (employeeId: string) => ['loans', 'employee', employeeId] as const,
    installments: (loanId: string) => ['loans', loanId, 'installments'] as const,
  },
  
  // Document queries
  documents: {
    templates: ['document-templates'] as const,
    types: ['document-types'] as const,
    byEmployee: (employeeId: string) => ['employee-documents', employeeId] as const,
  },
  
  // Attendance queries
  attendance: {
    records: {
      all: ['attendance-records'] as const,
      byEmployee: (employeeId: string) => ['attendance-records', employeeId] as const,
      byDate: (date: string) => ['attendance-records', 'date', date] as const,
    },
    corrections: ['attendance-corrections'] as const,
  },
  
  // Benefits queries
  benefits: {
    plans: ['benefit-plans'] as const,
    enrollments: {
      all: ['benefit-enrollments'] as const,
      byEmployee: (employeeId: string) => ['benefit-enrollments', employeeId] as const,
    },
    claims: ['benefit-claims'] as const,
  },
  
  // Company/Settings queries
  company: {
    settings: ['company-settings'] as const,
    workLocations: ['work-locations'] as const,
    banks: ['banks'] as const,
  },
  
  // Onboarding/Offboarding queries
  workflows: {
    onboarding: {
      all: ['onboarding-workflows'] as const,
      templates: ['onboarding-templates'] as const,
      byEmployee: (employeeId: string) => ['onboarding', employeeId] as const,
    },
    offboarding: {
      all: ['offboarding-records'] as const,
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
} as const;

// Type helpers for query key types
export type QueryKeys = typeof queryKeys;
