/**
 * Unit Tests for Dashboard Utilities
 * Tests shared dashboard utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculatePercentChange,
  formatEmployeeName,
  calculateOutstandingBalance,
} from '../utils';

describe('Dashboard Utils', () => {
  // ============================================
  // calculatePercentChange
  // ============================================

  describe('calculatePercentChange', () => {
    it('calculates positive percent change correctly', () => {
      expect(calculatePercentChange(120, 100)).toBe(20);
    });

    it('calculates negative percent change correctly', () => {
      expect(calculatePercentChange(80, 100)).toBe(-20);
    });

    it('returns 0 when values are equal', () => {
      expect(calculatePercentChange(100, 100)).toBe(0);
    });

    it('returns 0 when previous value is 0', () => {
      expect(calculatePercentChange(100, 0)).toBe(0);
    });

    it('rounds to nearest integer', () => {
      expect(calculatePercentChange(133, 100)).toBe(33);
      expect(calculatePercentChange(166, 100)).toBe(66);
    });

    it('handles large percent changes', () => {
      expect(calculatePercentChange(300, 100)).toBe(200);
      expect(calculatePercentChange(1000, 100)).toBe(900);
    });

    it('handles small values', () => {
      expect(calculatePercentChange(0.5, 0.25)).toBe(100);
    });

    it('handles decimal results', () => {
      // 105/100 = 1.05 = 5%
      expect(calculatePercentChange(105, 100)).toBe(5);
    });

    it('handles zero current value', () => {
      expect(calculatePercentChange(0, 100)).toBe(-100);
    });
  });

  // ============================================
  // formatEmployeeName
  // ============================================

  describe('formatEmployeeName', () => {
    it('formats full name correctly', () => {
      expect(formatEmployeeName('John', 'Doe')).toBe('John Doe');
    });

    it('handles first name only', () => {
      expect(formatEmployeeName('John', null)).toBe('John');
    });

    it('handles last name only', () => {
      expect(formatEmployeeName(null, 'Doe')).toBe('Doe');
    });

    it('returns empty string when both are null', () => {
      expect(formatEmployeeName(null, null)).toBe('');
    });

    it('returns empty string when both are undefined', () => {
      expect(formatEmployeeName(undefined, undefined)).toBe('');
    });

    it('handles empty strings', () => {
      expect(formatEmployeeName('', '')).toBe('');
    });

    it('trims extra whitespace', () => {
      expect(formatEmployeeName('  John  ', '  Doe  ')).toBe('John   Doe');
    });

    it('handles mixed null and undefined', () => {
      expect(formatEmployeeName('John', undefined)).toBe('John');
      expect(formatEmployeeName(undefined, 'Doe')).toBe('Doe');
    });
  });

  // ============================================
  // calculateOutstandingBalance
  // ============================================

  describe('calculateOutstandingBalance', () => {
    it('calculates total of due installments', () => {
      const installments = [
        { amount: 1000, status: 'due' },
        { amount: 1000, status: 'due' },
        { amount: 1000, status: 'paid' },
      ];
      expect(calculateOutstandingBalance(installments)).toBe(2000);
    });

    it('returns 0 when no due installments', () => {
      const installments = [
        { amount: 1000, status: 'paid' },
        { amount: 1000, status: 'skipped' },
      ];
      expect(calculateOutstandingBalance(installments)).toBe(0);
    });

    it('returns 0 for empty array', () => {
      expect(calculateOutstandingBalance([])).toBe(0);
    });

    it('handles mixed statuses correctly', () => {
      const installments = [
        { amount: 500, status: 'due' },
        { amount: 750, status: 'paid' },
        { amount: 1000, status: 'due' },
        { amount: 250, status: 'skipped' },
        { amount: 300, status: 'due' },
      ];
      expect(calculateOutstandingBalance(installments)).toBe(1800);
    });

    it('handles string amounts that need conversion', () => {
      const installments = [
        { amount: 1000 as any, status: 'due' },
        { amount: '500' as any, status: 'due' },
      ];
      expect(calculateOutstandingBalance(installments)).toBe(1500);
    });

    it('handles decimal amounts', () => {
      const installments = [
        { amount: 100.50, status: 'due' },
        { amount: 200.75, status: 'due' },
      ];
      expect(calculateOutstandingBalance(installments)).toBe(301.25);
    });

    it('only counts exact "due" status', () => {
      const installments = [
        { amount: 1000, status: 'due' },
        { amount: 1000, status: 'DUE' }, // uppercase - should not match
        { amount: 1000, status: 'overdue' }, // different status
      ];
      expect(calculateOutstandingBalance(installments)).toBe(1000);
    });
  });
});

// ============================================
// Re-exported Date Utils (verify they work)
// ============================================

describe('Re-exported Date Utils from Dashboard Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('re-exports calculateNextPayrollDate', async () => {
    const { calculateNextPayrollDate } = await import('../utils');
    expect(calculateNextPayrollDate(25)).toBe('2024-06-25');
  });

  it('re-exports getTodayString', async () => {
    const { getTodayString } = await import('../utils');
    expect(getTodayString()).toBe('2024-06-15');
  });

  it('re-exports getFirstDayOfCurrentMonth', async () => {
    const { getFirstDayOfCurrentMonth } = await import('../utils');
    expect(getFirstDayOfCurrentMonth()).toBe('2024-06-01');
  });

  it('re-exports getFirstDayOfLastMonth', async () => {
    const { getFirstDayOfLastMonth } = await import('../utils');
    expect(getFirstDayOfLastMonth()).toBe('2024-05-01');
  });

  it('re-exports getLastDayOfLastMonth', async () => {
    const { getLastDayOfLastMonth } = await import('../utils');
    expect(getLastDayOfLastMonth()).toBe('2024-05-31');
  });

  it('re-exports getCurrentYear', async () => {
    const { getCurrentYear } = await import('../utils');
    expect(getCurrentYear()).toBe(2024);
  });
});
