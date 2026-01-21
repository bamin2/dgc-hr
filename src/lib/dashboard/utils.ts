/**
 * Shared Dashboard Utilities
 * Common functions used across personal, team, and admin dashboard hooks
 */

// Re-export date utilities from centralized location
export {
  calculateNextPayrollDate,
  getTodayString,
  getFirstDayOfCurrentMonth,
  getFirstDayOfLastMonth,
  getLastDayOfLastMonth,
  getCurrentYear,
} from '@/lib/dateUtils';

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

/**
 * Get the maximum days from the first tier of salary deduction tiers
 * Used for displaying tiered leave types (e.g., Sick Leave shows only first tier)
 */
export function getFirstTierMax(tiers: any[] | null): number | null {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }
  // Sort by from_days to ensure we get the first tier
  const sorted = [...tiers].sort((a, b) => a.from_days - b.from_days);
  return sorted[0]?.to_days ?? null;
}
