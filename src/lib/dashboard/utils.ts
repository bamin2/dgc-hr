/**
 * Shared Dashboard Utilities
 * Common functions used across personal, team, and admin dashboard hooks
 */

/**
 * Calculate the next payroll date based on the configured day of month
 */
export function calculateNextPayrollDate(payrollDayOfMonth: number): string {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let nextPayrollDate: Date;
  
  if (currentDay < payrollDayOfMonth) {
    // Payroll is still this month
    nextPayrollDate = new Date(currentYear, currentMonth, payrollDayOfMonth);
  } else {
    // Payroll is next month
    nextPayrollDate = new Date(currentYear, currentMonth + 1, payrollDayOfMonth);
  }

  // Handle months with fewer days than payrollDayOfMonth
  const lastDayOfMonth = new Date(
    nextPayrollDate.getFullYear(), 
    nextPayrollDate.getMonth() + 1, 
    0
  ).getDate();
  
  if (payrollDayOfMonth > lastDayOfMonth) {
    nextPayrollDate.setDate(lastDayOfMonth);
  }

  return nextPayrollDate.toISOString().split('T')[0];
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get first day of current month as ISO string
 */
export function getFirstDayOfCurrentMonth(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0];
}

/**
 * Get first day of last month as ISO string
 */
export function getFirstDayOfLastMonth(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() - 1, 1)
    .toISOString().split('T')[0];
}

/**
 * Get last day of last month as ISO string
 */
export function getLastDayOfLastMonth(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 0)
    .toISOString().split('T')[0];
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format employee name from first and last name
 */
export function formatEmployeeName(firstName?: string | null, lastName?: string | null): string {
  return `${firstName || ''} ${lastName || ''}`.trim();
}

/**
 * Calculate outstanding balance from loan installments
 */
export function calculateOutstandingBalance(
  installments: Array<{ amount: number; status: string }>
): number {
  return installments
    .filter(i => i.status === 'due')
    .reduce((sum, i) => sum + Number(i.amount), 0);
}
