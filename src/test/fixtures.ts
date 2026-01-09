/**
 * Test Fixtures - Mock data for integration tests
 * 
 * These fixtures provide consistent test data across all test files.
 * Use spread operator to create variations when needed.
 */

// Using inline types for test fixtures to avoid coupling with app types

// ============================================================================
// Employee Fixtures
// ============================================================================

export const mockEmployee = {
  id: '00000000-0000-0000-0000-000000000001',
  firstName: 'John',
  secondName: null,
  lastName: 'Doe',
  fullName: 'John Doe',
  preferredName: 'Johnny',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  dateOfBirth: '1990-01-15',
  gender: 'male' as const,
  nationality: 'US',
  address: '123 Main St, City, State 12345',
  country: 'United States',
  employeeCode: 'EMP001',
  status: 'active' as const,
  employmentType: 'full_time' as const,
  workerType: 'employee' as const,
  departmentId: '00000000-0000-0000-0000-000000000010',
  positionId: '00000000-0000-0000-0000-000000000020',
  managerId: '00000000-0000-0000-0000-000000000002',
  workLocationId: '00000000-0000-0000-0000-000000000030',
  workLocation: 'Main Office',
  location: 'New York',
  joinDate: '2022-01-01',
  salary: 75000,
  payFrequency: 'monthly' as const,
  bankName: 'Test Bank',
  bankAccountNumber: '****1234',
  iban: 'US12345678901234567890',
  isSubjectToGosi: false,
  gosiRegisteredSalary: null,
  taxExemptionStatus: 'standard',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '+0987654321',
  emergencyContactRelationship: 'Spouse',
  avatarUrl: null,
  userId: null,
  sendOfferLetter: false,
  offerLetterTemplate: null,
  importBatchId: null,
  createdAt: '2022-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
  second_name: null,
  last_name: 'Doe',
  full_name: 'John Doe',
  preferred_name: 'Johnny',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  date_of_birth: '1990-01-15',
  gender: 'male',
  nationality: 'US',
  address: '123 Main St, City, State 12345',
  country: 'United States',
  employee_code: 'EMP001',
  status: 'active',
  employment_type: 'full_time',
  worker_type: 'employee',
  department_id: '00000000-0000-0000-0000-000000000010',
  position_id: '00000000-0000-0000-0000-000000000020',
  manager_id: '00000000-0000-0000-0000-000000000002',
  work_location_id: '00000000-0000-0000-0000-000000000030',
  work_location: 'Main Office',
  location: 'New York',
  join_date: '2022-01-01',
  salary: 75000,
  pay_frequency: 'monthly',
  bank_name: 'Test Bank',
  bank_account_number: '****1234',
  iban: 'US12345678901234567890',
  is_subject_to_gosi: false,
  gosi_registered_salary: null,
  tax_exemption_status: 'standard',
  emergency_contact_name: 'Jane Doe',
  emergency_contact_phone: '+0987654321',
  emergency_contact_relationship: 'Spouse',
  avatar_url: null,
  user_id: null,
  send_offer_letter: false,
  offer_letter_template: null,
  import_batch_id: null,
  created_at: '2022-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockEmployees = [
  mockEmployee,
  {
    ...mockEmployee,
    id: '00000000-0000-0000-0000-000000000002',
    firstName: 'Jane',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    employeeCode: 'EMP002',
    managerId: null,
  },
  {
    ...mockEmployee,
    id: '00000000-0000-0000-0000-000000000003',
    firstName: 'Bob',
    lastName: 'Johnson',
    fullName: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    employeeCode: 'EMP003',
    status: 'on_boarding' as const,
  },
];

// ============================================================================
// Leave Type Fixtures
// ============================================================================

export const mockLeaveType = {
  id: '00000000-0000-0000-0000-000000000100',
  name: 'Annual Leave',
  description: 'Paid annual vacation days',
  color: '#4CAF50',
  max_days_per_year: 21,
  is_paid: true,
  requires_approval: true,
  requires_document: false,
  document_required_after_days: null,
  min_days_notice: 7,
  max_consecutive_days: 14,
  allow_carryover: true,
  max_carryover_days: 5,
  count_weekends: false,
  is_active: true,
  visible_to_employees: true,
  has_salary_deduction: false,
  salary_deduction_tiers: null,
  created_at: '2022-01-01T00:00:00Z',
  updated_at: '2022-01-01T00:00:00Z',
};

export const mockLeaveTypes = [
  mockLeaveType,
  {
    ...mockLeaveType,
    id: '00000000-0000-0000-0000-000000000101',
    name: 'Sick Leave',
    description: 'Leave for illness or medical appointments',
    color: '#F44336',
    max_days_per_year: 10,
    min_days_notice: 0,
    requires_document: true,
    document_required_after_days: 3,
  },
  {
    ...mockLeaveType,
    id: '00000000-0000-0000-0000-000000000102',
    name: 'Personal Leave',
    description: 'Leave for personal matters',
    color: '#2196F3',
    max_days_per_year: 5,
    is_paid: false,
  },
];

// ============================================================================
// Leave Balance Fixtures
// ============================================================================

export const mockLeaveBalance = {
  id: '00000000-0000-0000-0000-000000000200',
  employee_id: mockEmployee.id,
  leave_type_id: mockLeaveType.id,
  year: new Date().getFullYear(),
  total_days: 21,
  used_days: 5,
  pending_days: 2,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockLeaveBalances = [
  mockLeaveBalance,
  {
    ...mockLeaveBalance,
    id: '00000000-0000-0000-0000-000000000201',
    leave_type_id: '00000000-0000-0000-0000-000000000101',
    total_days: 10,
    used_days: 2,
    pending_days: 0,
  },
];

// ============================================================================
// Leave Request Fixtures
// ============================================================================

export const mockLeaveRequest = {
  id: '00000000-0000-0000-0000-000000000300',
  employee_id: mockEmployee.id,
  leave_type_id: mockLeaveType.id,
  start_date: '2024-06-01',
  end_date: '2024-06-05',
  days_count: 5,
  is_half_day: false,
  reason: 'Family vacation',
  status: 'pending',
  rejectionReason: null,
  reviewedBy: null,
  reviewedAt: null,
  createdAt: '2024-05-15T10:00:00Z',
  updatedAt: '2024-05-15T10:00:00Z',
};

export const mockLeaveRequests = [
  mockLeaveRequest,
  {
    ...mockLeaveRequest,
    id: '00000000-0000-0000-0000-000000000301',
    status: 'approved',
    reviewedBy: '00000000-0000-0000-0000-000000000002',
    reviewedAt: '2024-05-16T14:00:00Z',
  },
  {
    ...mockLeaveRequest,
    id: '00000000-0000-0000-0000-000000000302',
    status: 'rejected',
    rejectionReason: 'Team coverage insufficient during this period',
    reviewedBy: '00000000-0000-0000-0000-000000000002',
    reviewedAt: '2024-05-16T14:00:00Z',
  },
];

// ============================================================================
// Department Fixtures
// ============================================================================

export const mockDepartment = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Engineering',
  description: 'Software development team',
  manager_id: '00000000-0000-0000-0000-000000000002',
  created_at: '2022-01-01T00:00:00Z',
};

export const mockDepartments = [
  mockDepartment,
  {
    ...mockDepartment,
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Human Resources',
    description: 'HR and people operations',
  },
  {
    ...mockDepartment,
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Finance',
    description: 'Financial operations',
  },
];

// ============================================================================
// Position Fixtures
// ============================================================================

export const mockPosition = {
  id: '00000000-0000-0000-0000-000000000020',
  title: 'Software Engineer',
  description: 'Develops and maintains software applications',
  department_id: mockDepartment.id,
  is_active: true,
  created_at: '2022-01-01T00:00:00Z',
};

export const mockPositions = [
  mockPosition,
  {
    ...mockPosition,
    id: '00000000-0000-0000-0000-000000000021',
    title: 'Senior Software Engineer',
    description: 'Senior development role',
  },
  {
    ...mockPosition,
    id: '00000000-0000-0000-0000-000000000022',
    title: 'Engineering Manager',
    description: 'Manages engineering team',
  },
];

// ============================================================================
// Work Location Fixtures
// ============================================================================

export const mockWorkLocation = {
  id: '00000000-0000-0000-0000-000000000030',
  name: 'Main Office',
  address: '123 Business Ave, Suite 100',
  city: 'New York',
  country: 'United States',
  timezone: 'America/New_York',
  is_active: true,
  is_default: true,
  currency: 'USD',
  created_at: '2022-01-01T00:00:00Z',
  updated_at: '2022-01-01T00:00:00Z',
};

export const mockWorkLocations = [
  mockWorkLocation,
  {
    ...mockWorkLocation,
    id: '00000000-0000-0000-0000-000000000031',
    name: 'Remote',
    address: null,
    is_default: false,
  },
];

// ============================================================================
// Payroll Fixtures
// ============================================================================

export const mockPayrollRun = {
  id: '00000000-0000-0000-0000-000000000400',
  pay_period_start: '2024-01-01',
  pay_period_end: '2024-01-31',
  payment_date: '2024-02-05',
  status: 'draft',
  total_gross: 150000,
  total_deductions: 30000,
  total_net: 120000,
  employee_count: 10,
  notes: null,
  created_by: '00000000-0000-0000-0000-000000000002',
  approved_by: null,
  approved_at: null,
  created_at: '2024-01-25T00:00:00Z',
  updated_at: '2024-01-25T00:00:00Z',
};

export const mockPayrollEmployee = {
  id: '00000000-0000-0000-0000-000000000500',
  payroll_run_id: mockPayrollRun.id,
  employee_id: mockEmployee.id,
  base_salary: 75000,
  gross_salary: 75000,
  total_allowances: 5000,
  total_deductions: 10000,
  net_salary: 70000,
  work_days: 22,
  absent_days: 0,
  overtime_hours: 0,
  overtime_amount: 0,
  status: 'pending',
  created_at: '2024-01-25T00:00:00Z',
};

// ============================================================================
// Onboarding Fixtures
// ============================================================================

export const mockOnboardingWorkflow = {
  id: '00000000-0000-0000-0000-000000000600',
  name: 'Standard Onboarding',
  description: 'Default onboarding workflow for new employees',
  is_active: true,
  is_default: true,
  created_at: '2022-01-01T00:00:00Z',
  updated_at: '2022-01-01T00:00:00Z',
};

export const mockOnboardingRecord = {
  id: '00000000-0000-0000-0000-000000000700',
  employee_id: mockEmployee.id,
  workflow_id: mockOnboardingWorkflow.id,
  workflow_name: 'Standard Onboarding',
  status: 'in_progress',
  start_date: '2024-01-01',
  scheduled_completion: '2024-01-14',
  completed_on: null,
  manager_id: '00000000-0000-0000-0000-000000000002',
  buddy_id: null,
  hr_contact_id: null,
  it_contact_id: null,
  welcome_message: 'Welcome to the team!',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockOnboardingTask = {
  id: '00000000-0000-0000-0000-000000000800',
  onboarding_record_id: mockOnboardingRecord.id,
  title: 'Complete personal information form',
  description: 'Fill out all required personal details',
  category: 'documentation',
  assigned_to: 'employee',
  status: 'pending',
  is_required: true,
  task_order: 1,
  due_date: '2024-01-03',
  completed_at: null,
  completed_by: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mock employee with custom overrides
 */
export function createMockEmployee(overrides: Partial<typeof mockEmployee> = {}) {
  return {
    ...mockEmployee,
    id: `00000000-0000-0000-0000-${Math.random().toString().slice(2, 14).padStart(12, '0')}`,
    ...overrides,
  };
}

/**
 * Create a mock leave request with custom overrides
 */
export function createMockLeaveRequest(overrides: Partial<typeof mockLeaveRequest> = {}) {
  return {
    ...mockLeaveRequest,
    id: `00000000-0000-0000-0000-${Math.random().toString().slice(2, 14).padStart(12, '0')}`,
    ...overrides,
  };
}

/**
 * Generate a list of mock employees
 */
export function generateMockEmployees(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createMockEmployee({
      firstName: `Employee${i + 1}`,
      lastName: `Test${i + 1}`,
      fullName: `Employee${i + 1} Test${i + 1}`,
      email: `employee${i + 1}@example.com`,
      employeeCode: `EMP${String(i + 1).padStart(3, '0')}`,
    })
  );
}
