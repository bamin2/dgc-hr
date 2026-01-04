import { mockEmployees } from './employees';

export type ReportType = 'attendance' | 'payroll' | 'benefits' | 'employees' | 'leave';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface ReportSummary {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  lastGenerated: string;
  frequency: string;
}

export interface AttendanceReportData {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  total: number;
  attendanceRate: number;
}

export interface PayrollReportData {
  month: string;
  grossPay: number;
  taxes: number;
  benefits: number;
  netPay: number;
  headcount: number;
}

export interface DepartmentStats {
  department: string;
  headcount: number;
  avgSalary: number;
  attendanceRate: number;
  leaveBalance: number;
  turnoverRate: number;
}

export interface LeaveReportData {
  type: string;
  taken: number;
  remaining: number;
  pending: number;
}

// Summary stats for dashboard
export interface ReportDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  averageSalary: number;
  attendanceRate: number;
  pendingLeaves: number;
  monthlyPayroll: number;
}

export const reportsList: ReportSummary[] = [
  {
    id: 'rpt-1',
    name: 'Monthly Attendance Report',
    type: 'attendance',
    description: 'Comprehensive attendance tracking including present, absent, late arrivals, and leave data',
    lastGenerated: '2024-01-15',
    frequency: 'Monthly'
  },
  {
    id: 'rpt-2',
    name: 'Payroll Summary Report',
    type: 'payroll',
    description: 'Detailed payroll breakdown with gross pay, deductions, taxes, and net pay',
    lastGenerated: '2024-01-14',
    frequency: 'Monthly'
  },
  {
    id: 'rpt-3',
    name: 'Benefits Enrollment Report',
    type: 'benefits',
    description: 'Overview of employee benefits enrollments and associated costs',
    lastGenerated: '2024-01-10',
    frequency: 'Quarterly'
  },
  {
    id: 'rpt-4',
    name: 'Employee Headcount Report',
    type: 'employees',
    description: 'Department-wise employee distribution and demographics',
    lastGenerated: '2024-01-12',
    frequency: 'Monthly'
  },
  {
    id: 'rpt-5',
    name: 'Leave Balance Report',
    type: 'leave',
    description: 'Summary of leave balances, usage, and pending requests by employee',
    lastGenerated: '2024-01-13',
    frequency: 'Weekly'
  }
];

// Generate attendance data for the last 30 days
export const generateAttendanceReportData = (): AttendanceReportData[] => {
  const data: AttendanceReportData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const total = mockEmployees.length;
    const present = Math.floor(Math.random() * 3) + 7;
    const absent = Math.floor(Math.random() * 2);
    const late = Math.floor(Math.random() * 2);
    const onLeave = total - present - absent;
    
    data.push({
      date: date.toISOString().split('T')[0],
      present,
      absent,
      late,
      onLeave: Math.max(0, onLeave),
      total,
      attendanceRate: Math.round((present / total) * 100)
    });
  }
  
  return data;
};

// Generate payroll data for the last 12 months
export const generatePayrollReportData = (): PayrollReportData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.map((month, index) => {
    const baseGross = 85000 + Math.floor(Math.random() * 10000);
    const taxes = Math.round(baseGross * 0.22);
    const benefits = Math.round(baseGross * 0.08);
    const netPay = baseGross - taxes - benefits;
    
    return {
      month,
      grossPay: baseGross,
      taxes,
      benefits,
      netPay,
      headcount: 8 + Math.floor(Math.random() * 3)
    };
  }).slice(0, currentMonth + 1);
};

// Department statistics
export const departmentStats: DepartmentStats[] = [
  {
    department: 'Engineering',
    headcount: 4,
    avgSalary: 102500,
    attendanceRate: 96,
    leaveBalance: 48,
    turnoverRate: 5
  },
  {
    department: 'Design',
    headcount: 2,
    avgSalary: 97500,
    attendanceRate: 92,
    leaveBalance: 24,
    turnoverRate: 8
  },
  {
    department: 'Marketing',
    headcount: 2,
    avgSalary: 101000,
    attendanceRate: 94,
    leaveBalance: 22,
    turnoverRate: 10
  },
  {
    department: 'Finance',
    headcount: 1,
    avgSalary: 78000,
    attendanceRate: 88,
    leaveBalance: 12,
    turnoverRate: 15
  },
  {
    department: 'Human Resources',
    headcount: 1,
    avgSalary: 95000,
    attendanceRate: 98,
    leaveBalance: 14,
    turnoverRate: 3
  },
  {
    department: 'Sales',
    headcount: 1,
    avgSalary: 65000,
    attendanceRate: 85,
    leaveBalance: 10,
    turnoverRate: 20
  }
];

// Leave report data
export const leaveReportData: LeaveReportData[] = [
  { type: 'Annual Leave', taken: 45, remaining: 120, pending: 8 },
  { type: 'Sick Leave', taken: 12, remaining: 48, pending: 2 },
  { type: 'Personal Leave', taken: 8, remaining: 22, pending: 1 },
  { type: 'Maternity/Paternity', taken: 20, remaining: 40, pending: 0 },
  { type: 'Unpaid Leave', taken: 5, remaining: 0, pending: 3 }
];

// Dashboard stats
export const getReportDashboardStats = (): ReportDashboardStats => {
  const activeEmployees = mockEmployees.filter(e => e.status === 'active').length;
  const totalSalary = mockEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
  
  return {
    totalEmployees: mockEmployees.length,
    activeEmployees,
    averageSalary: Math.round(totalSalary / mockEmployees.length),
    attendanceRate: 94,
    pendingLeaves: 14,
    monthlyPayroll: totalSalary
  };
};
