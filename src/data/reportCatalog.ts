import { ReportDefinition } from '@/types/reports';

export const reportCatalog: ReportDefinition[] = [
  // Payroll Reports
  {
    id: 'payroll-run-summary',
    name: 'Payroll Run Summary Report',
    category: 'payroll',
    description: 'Summary of payroll runs with totals for gross, deductions, net pay, GOSI contributions, and loan deductions',
    exportFormats: ['excel', 'csv', 'pdf'],
  },
  {
    id: 'payroll-detailed',
    name: 'Payroll Detailed Report',
    category: 'payroll',
    description: 'Per-employee breakdown of salary components, allowances, deductions, and net pay by payroll run',
    exportFormats: ['excel', 'csv'],
  },
  {
    id: 'payslip-register',
    name: 'Payslip Register',
    category: 'payroll',
    description: 'Track payslip issuance status for each employee per payroll run',
    exportFormats: ['excel', 'csv'],
  },

  // Salary Reports
  {
    id: 'salary-distribution',
    name: 'Salary Distribution Report',
    category: 'salary',
    description: 'Salary statistics including average, median, and ranges grouped by department and location',
    exportFormats: ['excel', 'csv'],
  },
  {
    id: 'salary-change-history',
    name: 'Salary Change History',
    category: 'salary',
    description: 'Historical record of all salary changes with before/after values and change reasons',
    exportFormats: ['excel', 'csv'],
  },

  // Leave Reports
  {
    id: 'leave-balance',
    name: 'Leave Balance Report',
    category: 'leave',
    description: 'Current leave balances showing entitled, taken, pending, and remaining days per employee',
    exportFormats: ['excel', 'csv'],
  },
  {
    id: 'leave-requests',
    name: 'Leave Requests Report',
    category: 'leave',
    description: 'All leave requests with approval workflow status and outcomes',
    exportFormats: ['excel', 'csv'],
  },

  // Loan Reports
  {
    id: 'loan-summary',
    name: 'Loan Summary Report',
    category: 'loans',
    description: 'Overview of all employee loans with original amounts, outstanding balances, and payment status',
    exportFormats: ['excel', 'csv'],
  },
  {
    id: 'loan-installments',
    name: 'Loan Installments Report',
    category: 'loans',
    description: 'Monthly breakdown of loan installments with payment status and deduction method',
    exportFormats: ['excel', 'csv'],
  },

  // Compliance Reports
  {
    id: 'gosi-contribution',
    name: 'GOSI Contribution Report',
    category: 'compliance',
    description: 'Employee and employer GOSI contributions by nationality and location',
    exportFormats: ['excel', 'csv', 'pdf'],
  },

  // Employee Reports
  {
    id: 'employee-master',
    name: 'Employee Master Report',
    category: 'employees',
    description: 'Complete employee directory with department, position, location, and employment details',
    exportFormats: ['excel', 'csv'],
  },
];

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    payroll: 'Payroll',
    salary: 'Salary',
    leave: 'Leave',
    loans: 'Loans',
    compliance: 'Compliance',
    employees: 'Employees',
  };
  return labels[category] || category;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    payroll: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    salary: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    leave: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    loans: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400',
    compliance: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
    employees: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};
