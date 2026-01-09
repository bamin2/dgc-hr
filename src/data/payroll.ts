// Simplified employee for payroll display
export interface PayrollEmployee {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  avatar?: string;
  employeeCode?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employee: PayrollEmployee;
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
  status: 'completed' | 'processing' | 'scheduled' | 'draft' | 'payslips_issued';
  processedDate: string;
}
