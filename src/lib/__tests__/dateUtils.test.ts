/**
 * Unit Tests for dateUtils.ts
 * Tests all centralized date utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTodayString,
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  getFirstDayOfLastMonth,
  getLastDayOfLastMonth,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getCurrentYear,
  getCurrentMonth,
  calculateNextPayrollDate,
  getPayrollPeriod,
  getDateRangeMonthsBack,
  getCurrentWeekRange,
  getNextNDaysRange,
  isDateInRange,
  areSameDay,
  getDaysBetween,
  formatDisplayDate,
  formatShortDate,
  formatLongDate,
  formatISODate,
  formatDateTime,
  formatTime,
  formatRelativeDate,
  formatMonthYear,
  safeParseDate,
  parseDateOrDefault,
} from '../dateUtils';

// Mock date for consistent testing
const MOCK_DATE = new Date('2024-06-15T12:00:00.000Z');

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================
  // Date String Helpers
  // ============================================

  describe('getTodayString', () => {
    it('returns today date as ISO string', () => {
      expect(getTodayString()).toBe('2024-06-15');
    });
  });

  describe('getFirstDayOfCurrentMonth', () => {
    it('returns first day of current month', () => {
      expect(getFirstDayOfCurrentMonth()).toBe('2024-06-01');
    });
  });

  describe('getLastDayOfCurrentMonth', () => {
    it('returns last day of current month', () => {
      expect(getLastDayOfCurrentMonth()).toBe('2024-06-30');
    });

    it('handles months with 31 days', () => {
      vi.setSystemTime(new Date('2024-07-15T12:00:00.000Z'));
      expect(getLastDayOfCurrentMonth()).toBe('2024-07-31');
    });

    it('handles February in leap year', () => {
      vi.setSystemTime(new Date('2024-02-15T12:00:00.000Z'));
      expect(getLastDayOfCurrentMonth()).toBe('2024-02-29');
    });

    it('handles February in non-leap year', () => {
      vi.setSystemTime(new Date('2023-02-15T12:00:00.000Z'));
      expect(getLastDayOfCurrentMonth()).toBe('2023-02-28');
    });
  });

  describe('getFirstDayOfLastMonth', () => {
    it('returns first day of last month', () => {
      expect(getFirstDayOfLastMonth()).toBe('2024-05-01');
    });

    it('handles January (previous year)', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
      expect(getFirstDayOfLastMonth()).toBe('2023-12-01');
    });
  });

  describe('getLastDayOfLastMonth', () => {
    it('returns last day of last month', () => {
      expect(getLastDayOfLastMonth()).toBe('2024-05-31');
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('returns first day of given month', () => {
      const date = new Date('2024-03-15');
      expect(getFirstDayOfMonth(date)).toBe('2024-03-01');
    });
  });

  describe('getLastDayOfMonth', () => {
    it('returns last day of given month', () => {
      const date = new Date('2024-03-15');
      expect(getLastDayOfMonth(date)).toBe('2024-03-31');
    });
  });

  // ============================================
  // Year Helpers
  // ============================================

  describe('getCurrentYear', () => {
    it('returns current year', () => {
      expect(getCurrentYear()).toBe(2024);
    });
  });

  describe('getCurrentMonth', () => {
    it('returns current month (0-indexed)', () => {
      expect(getCurrentMonth()).toBe(5); // June is 5
    });
  });

  // ============================================
  // Payroll Date Calculations
  // ============================================

  describe('calculateNextPayrollDate', () => {
    it('returns this month if payroll day is ahead', () => {
      // Current day is 15, payroll day is 25
      const result = calculateNextPayrollDate(25);
      expect(result.date).toBe('2024-06-25');
      expect(result.wasAdjusted).toBe(false);
      expect(result.originalDay).toBe(25);
    });

    it('returns next month if payroll day has passed', () => {
      // Current day is 15, payroll day is 10
      const result = calculateNextPayrollDate(10);
      expect(result.date).toBe('2024-07-10');
      expect(result.wasAdjusted).toBe(false);
    });

    it('handles payroll day equal to current day', () => {
      // Current day is 15, payroll day is 15
      const result = calculateNextPayrollDate(15);
      expect(result.date).toBe('2024-07-15');
    });

    it('handles months with fewer days (e.g., Feb)', () => {
      vi.setSystemTime(new Date('2024-01-31T12:00:00.000Z'));
      // Payroll day 31, February only has 29 days (leap year)
      const result = calculateNextPayrollDate(31);
      expect(result.date).toBe('2024-02-29');
    });

    it('handles end of year rollover', () => {
      vi.setSystemTime(new Date('2024-12-20T12:00:00.000Z'));
      const result = calculateNextPayrollDate(15);
      expect(result.date).toBe('2025-01-15');
    });

    // Weekend adjustment tests
    it('returns Thursday when payroll falls on Friday with adjustment info', () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
      // Jan 2, 2026 is Friday - should return Jan 1 (Thursday)
      const result = calculateNextPayrollDate(2, [5, 6]);
      expect(result.date).toBe('2026-01-01');
      expect(result.wasAdjusted).toBe(true);
      expect(result.originalDay).toBe(2);
      expect(result.adjustmentReason).toBe('Friday');
    });

    it('returns Thursday when payroll falls on Saturday with adjustment info', () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
      // Jan 3, 2026 is Saturday - should return Jan 1 (Thursday)
      const result = calculateNextPayrollDate(3, [5, 6]);
      expect(result.date).toBe('2026-01-01');
      expect(result.wasAdjusted).toBe(true);
      expect(result.originalDay).toBe(3);
      expect(result.adjustmentReason).toBe('Saturday');
    });

    it('returns original date when not on weekend with no adjustment', () => {
      vi.setSystemTime(new Date('2026-01-20T12:00:00.000Z'));
      // Jan 26, 2026 is Monday - should stay as Jan 26
      const result = calculateNextPayrollDate(26, [5, 6]);
      expect(result.date).toBe('2026-01-26');
      expect(result.wasAdjusted).toBe(false);
      expect(result.adjustmentReason).toBeUndefined();
    });

    it('handles custom weekend days (Fri-Sat is default)', () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
      // Jan 4, 2026 is Sunday - with Sat-Sun weekend should return Jan 1 (Thursday)
      const result = calculateNextPayrollDate(4, [0, 6]);
      expect(result.date).toBe('2026-01-01');
      expect(result.wasAdjusted).toBe(true);
      expect(result.adjustmentReason).toBe('Sunday');
    });

    it('does not adjust when weekend days is empty', () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
      // Jan 2, 2026 is Friday - with empty weekend should stay as Jan 2
      const result = calculateNextPayrollDate(2, []);
      expect(result.date).toBe('2026-01-02');
      expect(result.wasAdjusted).toBe(false);
    });
  });

  describe('getPayrollPeriod', () => {
    it('returns start and end of current month by default', () => {
      const period = getPayrollPeriod();
      expect(period.start).toBe('2024-06-01');
      expect(period.end).toBe('2024-06-30');
    });

    it('returns start and end of specified month', () => {
      const date = new Date('2024-02-15');
      const period = getPayrollPeriod(date);
      expect(period.start).toBe('2024-02-01');
      expect(period.end).toBe('2024-02-29');
    });
  });

  // ============================================
  // Date Range Helpers
  // ============================================

  describe('getDateRangeMonthsBack', () => {
    it('returns correct range for 1 month back', () => {
      const range = getDateRangeMonthsBack(1);
      expect(range.start).toBe('2024-06-01');
      expect(range.end).toBe('2024-06-15');
    });

    it('returns correct range for 3 months back', () => {
      const range = getDateRangeMonthsBack(3);
      expect(range.start).toBe('2024-04-01');
      expect(range.end).toBe('2024-06-15');
    });

    it('returns correct range for 12 months back', () => {
      const range = getDateRangeMonthsBack(12);
      expect(range.start).toBe('2023-07-01');
      expect(range.end).toBe('2024-06-15');
    });
  });

  describe('getCurrentWeekRange', () => {
    it('returns start and end of current week', () => {
      const range = getCurrentWeekRange();
      // June 15, 2024 is a Saturday, week starts Sunday
      expect(range.start).toBe('2024-06-09');
      expect(range.end).toBe('2024-06-15');
    });
  });

  describe('getNextNDaysRange', () => {
    it('returns correct range for next 7 days', () => {
      const range = getNextNDaysRange(7);
      expect(range.start).toBe('2024-06-15');
      expect(range.end).toBe('2024-06-22');
    });

    it('returns correct range for next 30 days', () => {
      const range = getNextNDaysRange(30);
      expect(range.start).toBe('2024-06-15');
      expect(range.end).toBe('2024-07-15');
    });
  });

  // ============================================
  // Date Comparison Helpers
  // ============================================

  describe('isDateInRange', () => {
    it('returns true when date is in range', () => {
      expect(isDateInRange('2024-06-15', '2024-06-01', '2024-06-30')).toBe(true);
    });

    it('returns true when date is at start of range', () => {
      expect(isDateInRange('2024-06-01', '2024-06-01', '2024-06-30')).toBe(true);
    });

    it('returns true when date is at end of range', () => {
      expect(isDateInRange('2024-06-30', '2024-06-01', '2024-06-30')).toBe(true);
    });

    it('returns false when date is before range', () => {
      expect(isDateInRange('2024-05-31', '2024-06-01', '2024-06-30')).toBe(false);
    });

    it('returns false when date is after range', () => {
      expect(isDateInRange('2024-07-01', '2024-06-01', '2024-06-30')).toBe(false);
    });

    it('works with Date objects', () => {
      const date = new Date('2024-06-15');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');
      expect(isDateInRange(date, start, end)).toBe(true);
    });
  });

  describe('areSameDay', () => {
    it('returns true for same day', () => {
      expect(areSameDay('2024-06-15', '2024-06-15')).toBe(true);
    });

    it('returns false for different days', () => {
      expect(areSameDay('2024-06-15', '2024-06-16')).toBe(false);
    });

    it('works with Date objects', () => {
      const date1 = new Date('2024-06-15T10:00:00');
      const date2 = new Date('2024-06-15T20:00:00');
      expect(areSameDay(date1, date2)).toBe(true);
    });

    it('returns false for same day different year', () => {
      expect(areSameDay('2024-06-15', '2023-06-15')).toBe(false);
    });
  });

  describe('getDaysBetween', () => {
    it('returns correct number of days', () => {
      expect(getDaysBetween('2024-06-01', '2024-06-15')).toBe(14);
    });

    it('returns 0 for same day', () => {
      expect(getDaysBetween('2024-06-15', '2024-06-15')).toBe(0);
    });

    it('returns negative for reversed dates', () => {
      expect(getDaysBetween('2024-06-15', '2024-06-01')).toBe(-14);
    });

    it('works with Date objects', () => {
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-10');
      expect(getDaysBetween(start, end)).toBe(9);
    });
  });

  // ============================================
  // Date Formatting
  // ============================================

  describe('formatDisplayDate', () => {
    it('formats date correctly', () => {
      expect(formatDisplayDate('2024-06-15')).toBe('Jun 15, 2024');
    });

    it('returns empty string for null', () => {
      expect(formatDisplayDate(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatDisplayDate(undefined)).toBe('');
    });

    it('works with Date objects', () => {
      const date = new Date('2024-01-01');
      expect(formatDisplayDate(date)).toBe('Jan 1, 2024');
    });
  });

  describe('formatShortDate', () => {
    it('formats date correctly', () => {
      expect(formatShortDate('2024-06-15')).toBe('Jun 15');
    });

    it('returns empty string for null', () => {
      expect(formatShortDate(null)).toBe('');
    });
  });

  describe('formatLongDate', () => {
    it('formats date correctly', () => {
      expect(formatLongDate('2024-06-15')).toBe('June 15, 2024');
    });

    it('returns empty string for null', () => {
      expect(formatLongDate(null)).toBe('');
    });
  });

  describe('formatISODate', () => {
    it('formats date correctly', () => {
      expect(formatISODate('2024-06-15')).toBe('2024-06-15');
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-12-25');
      expect(formatISODate(date)).toBe('2024-12-25');
    });

    it('returns empty string for null', () => {
      expect(formatISODate(null)).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime correctly', () => {
      expect(formatDateTime('2024-06-15T15:30:00')).toBe('Jun 15, 2024 3:30 PM');
    });

    it('returns empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });
  });

  describe('formatTime', () => {
    it('formats time correctly for PM', () => {
      expect(formatTime('2024-06-15T15:30:00')).toBe('3:30 PM');
    });

    it('formats time correctly for AM', () => {
      expect(formatTime('2024-06-15T09:15:00')).toBe('9:15 AM');
    });

    it('returns empty string for null', () => {
      expect(formatTime(null)).toBe('');
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "Today" for today', () => {
      expect(formatRelativeDate('2024-06-15')).toBe('Today');
    });

    it('returns "Tomorrow" for tomorrow', () => {
      expect(formatRelativeDate('2024-06-16')).toBe('Tomorrow');
    });

    it('returns formatted date for other days', () => {
      expect(formatRelativeDate('2024-06-20')).toBe('Jun 20');
    });

    it('returns empty string for null', () => {
      expect(formatRelativeDate(null)).toBe('');
    });
  });

  describe('formatMonthYear', () => {
    it('formats month and year correctly', () => {
      expect(formatMonthYear('2024-06-15')).toBe('June 2024');
    });

    it('returns empty string for null', () => {
      expect(formatMonthYear(null)).toBe('');
    });
  });

  // ============================================
  // Parse Helpers
  // ============================================

  describe('safeParseDate', () => {
    it('parses valid date string', () => {
      const result = safeParseDate('2024-06-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(5); // June
      expect(result?.getDate()).toBe(15);
    });

    it('returns null for null input', () => {
      expect(safeParseDate(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(safeParseDate(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(safeParseDate('')).toBeNull();
    });
  });

  describe('parseDateOrDefault', () => {
    it('parses valid date string', () => {
      const result = parseDateOrDefault('2024-06-15');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
    });

    it('returns current date for null input', () => {
      const result = parseDateOrDefault(null);
      expect(areSameDay(result, MOCK_DATE)).toBe(true);
    });

    it('returns custom default for undefined input', () => {
      const customDefault = new Date('2020-01-01');
      const result = parseDateOrDefault(undefined, customDefault);
      expect(areSameDay(result, customDefault)).toBe(true);
    });

    it('returns default for empty string', () => {
      const result = parseDateOrDefault('');
      expect(areSameDay(result, MOCK_DATE)).toBe(true);
    });
  });
});
