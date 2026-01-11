/**
 * Performance instrumentation utilities
 * Enable by setting VITE_PERF_DEBUG=true in your .env file
 * 
 * Console output:
 * - Filter by "[PERF]" to see API round-trip times
 * - Filter by "[TTD]" to see Time-to-First-Data metrics
 */

import { useEffect, useRef } from 'react';

/**
 * Check if performance debug mode is enabled
 */
export const isPerfDebugEnabled = (): boolean => 
  import.meta.env.VITE_PERF_DEBUG === 'true';

/**
 * Log a performance metric to console (only when debug enabled)
 */
export const perfLog = (category: string, label: string, durationMs: number, failed = false): void => {
  if (!isPerfDebugEnabled()) return;
  
  const status = failed ? ' (failed)' : '';
  const icon = category === 'TTD' ? '📊' : '⏱️';
  console.log(`${icon} [${category}] ${label}: ${durationMs.toFixed(2)}ms${status}`);
};

/**
 * Measure async function execution time
 * 
 * @example
 * const data = await measureAsync('fetchUsers', () => supabase.from('users').select('*'));
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isPerfDebugEnabled()) {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    perfLog('PERF', label, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    perfLog('PERF', label, duration, true);
    throw error;
  }
}

/**
 * Wrap a Supabase query with timing instrumentation
 * 
 * @example
 * const result = await wrapSupabaseQuery('employees.select', () => 
 *   supabase.from('employees').select('*')
 * );
 */
export function wrapSupabaseQuery<T>(
  label: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return measureAsync(`Supabase: ${label}`, queryFn);
}

/**
 * Hook to track time-to-first-data for a page
 * Logs when isLoading transitions from true to false (data arrived)
 * 
 * @example
 * const { isLoading } = useQuery(...);
 * useTimeToFirstData('Dashboard', isLoading);
 */
export function useTimeToFirstData(pageName: string, isLoading: boolean): void {
  const mountTime = useRef<number | null>(null);
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!isPerfDebugEnabled()) return;
    
    // Record mount time on first render
    if (mountTime.current === null) {
      mountTime.current = performance.now();
    }
  }, []);

  useEffect(() => {
    if (!isPerfDebugEnabled()) return;
    
    // Log when loading completes (only once)
    if (!isLoading && mountTime.current !== null && !hasLogged.current) {
      const duration = performance.now() - mountTime.current;
      perfLog('TTD', pageName, duration);
      hasLogged.current = true;
    }
  }, [isLoading, pageName]);
}

/**
 * Create a performance marker for manual timing
 * 
 * @example
 * const marker = createPerfMarker('complexOperation');
 * // ... do work ...
 * marker.end(); // logs the duration
 */
export function createPerfMarker(label: string): { end: () => number } {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      perfLog('PERF', label, duration);
      return duration;
    }
  };
}
