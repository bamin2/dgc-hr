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
 * Get last day of current month as ISO string
 */
export function getLastDayOfCurrentMonth(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0)
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
 * Get first day of a specific month as ISO string
 */
export function getFirstDayOfMonth(date: Date): string {
  return startOfMonth(date).toISOString().split('T')[0];
}

/**
 * Get last day of a specific month as ISO string
 */
export function getLastDayOfMonth(date: Date): string {
  return endOfMonth(date).toISOString().split('T')[0];
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
    start: startDate.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
  };
}

/**
 * Get date range for the current week
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const today = new Date();
  return {
    start: startOfWeek(today, { weekStartsOn: 0 }).toISOString().split('T')[0],
    end: endOfWeek(today, { weekStartsOn: 0 }).toISOString().split('T')[0],
  };
}

/**
 * Get date range for the next N days
 */
export function getNextNDaysRange(days: number): { start: string; end: string } {
  const today = new Date();
  return {
    start: today.toISOString().split('T')[0],
    end: addDays(today, days).toISOString().split('T')[0],
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
