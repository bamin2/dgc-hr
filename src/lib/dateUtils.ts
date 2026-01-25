/**
 * Centralized Date Utilities
 * Common date formatting and calculation functions used across the codebase
 */

import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval, isSameDay, startOfWeek, endOfWeek, addDays } from 'date-fns';

// ============================================
// Date String Helpers (ISO format YYYY-MM-DD)
// ============================================

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get first day of current month as ISO string
 */
export function getFirstDayOfCurrentMonth(): string {
  const today = new Date();
  return format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
}

/**
 * Get last day of current month as ISO string
 */
export function getLastDayOfCurrentMonth(): string {
  const today = new Date();
  return format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd');
}

/**
 * Get first day of last month as ISO string
 */
export function getFirstDayOfLastMonth(): string {
  const today = new Date();
  return format(new Date(today.getFullYear(), today.getMonth() - 1, 1), 'yyyy-MM-dd');
}

/**
 * Get last day of last month as ISO string
 */
export function getLastDayOfLastMonth(): string {
  const today = new Date();
  return format(new Date(today.getFullYear(), today.getMonth(), 0), 'yyyy-MM-dd');
}

/**
 * Get first day of a specific month as ISO string
 */
export function getFirstDayOfMonth(date: Date): string {
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

/**
 * Get last day of a specific month as ISO string
 */
export function getLastDayOfMonth(date: Date): string {
  return format(endOfMonth(date), 'yyyy-MM-dd');
}

// ============================================
// Year Helpers
// ============================================

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get current month (0-indexed)
 */
export function getCurrentMonth(): number {
  return new Date().getMonth();
}

// ============================================
// Payroll Date Calculations
// ============================================

/**
 * Result of payroll date calculation including adjustment metadata
 */
export interface PayrollDateResult {
  date: string;
  wasAdjusted: boolean;
  originalDay: number;
  adjustmentReason?: string;
}

/**
 * Calculate the next payroll date based on the configured day of month
 * If the date falls on a weekend day, move to the preceding Thursday
 * 
 * @param payrollDayOfMonth - The configured payroll day (1-31)
 * @param weekendDays - Array of weekend day indices (0=Sunday, 5=Friday, 6=Saturday)
 */
export function calculateNextPayrollDate(
  payrollDayOfMonth: number,
  weekendDays: number[] = [5, 6]
): PayrollDateResult {
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

  // Track adjustment info
  let wasAdjusted = false;
  let adjustmentReason: string | undefined;

  // Adjust for weekends: if payroll falls on a weekend, move to Thursday before
  const dayOfWeek = nextPayrollDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  if (weekendDays.includes(dayOfWeek)) {
    wasAdjusted = true;
    
    // Determine the day name for the reason
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    adjustmentReason = dayNames[dayOfWeek];
    
    // Calculate days to subtract to reach Thursday (day 4)
    let daysToSubtract: number;
    if (dayOfWeek === 5) {
      // Friday → subtract 1 day to get Thursday
      daysToSubtract = 1;
    } else if (dayOfWeek === 6) {
      // Saturday → subtract 2 days to get Thursday
      daysToSubtract = 2;
    } else if (dayOfWeek === 0) {
      // Sunday (if included in weekendDays) → subtract 3 days to get Thursday
      daysToSubtract = 3;
    } else {
      // Other weekend configurations: calculate distance to previous Thursday
      // Thursday is day 4, so we need to go back (dayOfWeek - 4) days if dayOfWeek > 4
      // or (dayOfWeek + 7 - 4) days if dayOfWeek < 4
      daysToSubtract = dayOfWeek > 4 ? dayOfWeek - 4 : dayOfWeek + 3;
    }
    
    nextPayrollDate.setDate(nextPayrollDate.getDate() - daysToSubtract);
  }

  return {
    date: format(nextPayrollDate, 'yyyy-MM-dd'),
    wasAdjusted,
    originalDay: payrollDayOfMonth,
    adjustmentReason,
  };
}

/**
 * Get the payroll period for a given date (typically month start to end)
 */
export function getPayrollPeriod(date: Date = new Date()): { start: string; end: string } {
  return {
    start: getFirstDayOfMonth(date),
    end: getLastDayOfMonth(date),
  };
}

// ============================================
// Date Range Helpers
// ============================================

/**
 * Get date range for a specific number of months back from today
 */
export function getDateRangeMonthsBack(monthsBack: number): { start: string; end: string } {
  const today = new Date();
  const startDate = subMonths(startOfMonth(today), monthsBack - 1);
  return {
    start: format(startDate, 'yyyy-MM-dd'),
    end: format(today, 'yyyy-MM-dd'),
  };
}

/**
 * Get date range for the current week
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const today = new Date();
  return {
    start: format(startOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd'),
  };
}

/**
 * Get date range for the next N days
 */
export function getNextNDaysRange(days: number): { start: string; end: string } {
  const today = new Date();
  return {
    start: format(today, 'yyyy-MM-dd'),
    end: format(addDays(today, days), 'yyyy-MM-dd'),
  };
}

// ============================================
// Date Comparison Helpers
// ============================================

/**
 * Check if a date falls within a range
 */
export function isDateInRange(date: Date | string, start: Date | string, end: Date | string): boolean {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  return isWithinInterval(targetDate, { start: startDate, end: endDate });
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

/**
 * Get number of days between two dates
 */
export function getDaysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return differenceInDays(endDate, startDate);
}

// ============================================
// Date Formatting
// ============================================

/**
 * Format date to display format (e.g., "Jan 15, 2024")
 */
export function formatDisplayDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format date to short format (e.g., "Jan 15")
 */
export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

/**
 * Format date to long format (e.g., "January 15, 2024")
 */
export function formatLongDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM d, yyyy');
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatISODate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Format date with time (e.g., "Jan 15, 2024 3:30 PM")
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

/**
 * Format time only (e.g., "3:30 PM")
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

/**
 * Format relative date (e.g., "Today", "Tomorrow", "Jan 15")
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return formatShortDate(d);
}

/**
 * Format month and year (e.g., "January 2024")
 */
export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM yyyy');
}

// ============================================
// Parse Helpers
// ============================================

/**
 * Safely parse an ISO date string
 */
export function safeParseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  try {
    return parseISO(dateString);
  } catch {
    return null;
  }
}

/**
 * Parse date string to Date object, returns current date if invalid
 */
export function parseDateOrDefault(dateString: string | null | undefined, defaultDate: Date = new Date()): Date {
  if (!dateString) return defaultDate;
  try {
    return parseISO(dateString);
  } catch {
    return defaultDate;
  }
}
