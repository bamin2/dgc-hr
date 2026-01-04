import { Employee, mockEmployees } from './employees';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employee: Employee;
  payPeriod: {
    startDate: string;
    endDate: string;
  };
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: {
    tax: number;
    insurance: number;
    other: number;
  };
  netPay: number;
  status: 'paid' | 'pending' | 'processing';
  paidDate?: string;
}

export interface PayrollRun {
  id: string;
  payPeriod: { startDate: string; endDate: string };
  totalAmount: number;
  employeeCount: number;
  status: 'completed' | 'processing' | 'scheduled';
  processedDate: string;
}

// Generate payroll records from employees
export const mockPayrollRecords: PayrollRecord[] = mockEmployees.map((employee, index) => {
  const baseSalary = employee.salary || 70000;
  const monthlyBase = baseSalary / 12;
  const overtime = index % 3 === 0 ? Math.round(monthlyBase * 0.05) : 0;
  const bonuses = index % 4 === 0 ? Math.round(monthlyBase * 0.1) : 0;
  const tax = Math.round((monthlyBase + overtime + bonuses) * 0.22);
  const insurance = Math.round(monthlyBase * 0.03);
  const otherDeductions = index % 5 === 0 ? 150 : 0;
  const netPay = Math.round(monthlyBase + overtime + bonuses - tax - insurance - otherDeductions);
  
  const statuses: ('paid' | 'pending' | 'processing')[] = ['paid', 'paid', 'paid', 'pending', 'processing'];
  
  return {
    id: `PAY-${String(index + 1).padStart(3, '0')}`,
    employeeId: employee.id,
    employee,
    payPeriod: {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    },
    baseSalary: Math.round(monthlyBase),
    overtime,
    bonuses,
    deductions: {
      tax,
      insurance,
      other: otherDeductions,
    },
    netPay,
    status: statuses[index % statuses.length],
    paidDate: statuses[index % statuses.length] === 'paid' ? '2026-01-28' : undefined,
  };
});

export const mockPayrollRuns: PayrollRun[] = [
  {
    id: 'RUN-001',
    payPeriod: { startDate: '2026-01-01', endDate: '2026-01-31' },
    totalAmount: mockPayrollRecords.reduce((sum, r) => sum + r.netPay, 0),
    employeeCount: mockPayrollRecords.length,
    status: 'completed',
    processedDate: '2026-01-28',
  },
  {
    id: 'RUN-002',
    payPeriod: { startDate: '2025-12-01', endDate: '2025-12-31' },
    totalAmount: 68450,
    employeeCount: 10,
    status: 'completed',
    processedDate: '2025-12-28',
  },
  {
    id: 'RUN-003',
    payPeriod: { startDate: '2025-11-01', endDate: '2025-11-30' },
    totalAmount: 67890,
    employeeCount: 10,
    status: 'completed',
    processedDate: '2025-11-28',
  },
];

// Summary metrics
export const payrollMetrics = {
  totalPayroll: mockPayrollRecords.reduce((sum, r) => sum + r.netPay, 0),
  employeesPaid: mockPayrollRecords.filter(r => r.status === 'paid').length,
  pendingPayments: mockPayrollRecords.filter(r => r.status === 'pending').length,
  averageSalary: Math.round(
    mockPayrollRecords.reduce((sum, r) => sum + r.baseSalary, 0) / mockPayrollRecords.length
  ),
};

// Department-wise breakdown
export const departmentPayroll = mockEmployees.reduce((acc, emp) => {
  const record = mockPayrollRecords.find(r => r.employeeId === emp.id);
  if (record) {
    if (!acc[emp.department]) {
      acc[emp.department] = { department: emp.department, total: 0, count: 0 };
    }
    acc[emp.department].total += record.netPay;
    acc[emp.department].count += 1;
  }
  return acc;
}, {} as Record<string, { department: string; total: number; count: number }>);

export const departmentPayrollData = Object.values(departmentPayroll);
