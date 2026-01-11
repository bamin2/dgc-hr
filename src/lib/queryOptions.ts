import { keepPreviousData } from '@tanstack/react-query';

/**
 * Query option presets for different data types
 * Use these to maintain consistent caching behavior across the app
 */
export const queryPresets = {
  /**
   * For mostly-static reference data that rarely changes
   * Examples: departments, banks, document templates, leave types
   */
  referenceData: {
    staleTime: 1000 * 60 * 10,  // 10 minutes
    gcTime: 1000 * 60 * 30,     // 30 minutes cache retention
  },

  /**
   * For semi-static configuration data that changes occasionally
   * Examples: work locations, positions, company settings
   */
  configData: {
    staleTime: 1000 * 60 * 5,   // 5 minutes
    gcTime: 1000 * 60 * 15,     // 15 minutes cache retention
  },

  /**
   * For frequently changing data that needs freshness
   * Examples: dashboard metrics, pending approvals, notifications count
   */
  liveData: {
    staleTime: 1000 * 30,       // 30 seconds
    gcTime: 1000 * 60 * 5,      // 5 minutes cache retention
  },

  /**
   * For user-specific data that shouldn't refetch too often
   * Examples: employee lists, leave requests, payroll runs
   */
  userData: {
    staleTime: 1000 * 60 * 2,   // 2 minutes
    gcTime: 1000 * 60 * 10,     // 10 minutes cache retention
  },
} as const;

/**
 * Options for paginated/filtered list queries
 * Prevents blank UI states when changing pages or filters
 */
export const paginatedListOptions = {
  placeholderData: keepPreviousData,
  staleTime: 1000 * 60 * 2,     // 2 minutes for list data
} as const;

/**
 * Options for auth-dependent queries that shouldn't retry on failure
 * Examples: current user role, notifications, personal dashboard
 */
export const authQueryOptions = {
  retry: 0,
} as const;
