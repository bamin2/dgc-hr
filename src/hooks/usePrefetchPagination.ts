import { useEffect } from 'react';
import { useQueryClient, QueryKey } from '@tanstack/react-query';

interface UsePrefetchPaginationOptions {
  /** Base query key (will have page appended) */
  queryKey: QueryKey;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Function to fetch a specific page */
  prefetchFn: (page: number) => Promise<unknown>;
  /** Whether prefetching is enabled */
  enabled?: boolean;
  /** Stale time for prefetched data (default: 2 minutes) */
  staleTime?: number;
}

/**
 * Hook to prefetch the next page of paginated data.
 * Improves perceived performance by loading the next page before user clicks.
 * 
 * @example
 * usePrefetchPagination({
 *   queryKey: ['audit-logs', filters],
 *   currentPage: page,
 *   totalPages: data?.totalPages || 1,
 *   prefetchFn: async (nextPage) => {
 *     return fetchAuditLogs({ ...filters, page: nextPage });
 *   },
 *   enabled: !isLoading,
 * });
 */
export function usePrefetchPagination({
  queryKey,
  currentPage,
  totalPages,
  prefetchFn,
  enabled = true,
  staleTime = 1000 * 60 * 2, // 2 minutes default
}: UsePrefetchPaginationOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Don't prefetch if disabled or on last page
    if (!enabled || currentPage >= totalPages) return;

    const nextPage = currentPage + 1;
    
    // Build the query key for the next page
    const nextQueryKey = [...(Array.isArray(queryKey) ? queryKey : [queryKey])];
    // Find and update the page parameter if it exists, otherwise append
    const pageIndex = nextQueryKey.findIndex(
      (item) => typeof item === 'number' && item === currentPage
    );
    
    if (pageIndex !== -1) {
      nextQueryKey[pageIndex] = nextPage;
    } else {
      nextQueryKey.push(nextPage);
    }

    // Check if next page is already cached and fresh
    const existingData = queryClient.getQueryData(nextQueryKey);
    if (existingData) return;

    // Prefetch the next page
    queryClient.prefetchQuery({
      queryKey: nextQueryKey,
      queryFn: () => prefetchFn(nextPage),
      staleTime,
    });
  }, [currentPage, totalPages, enabled, queryClient, queryKey, prefetchFn, staleTime]);
}

/**
 * Hook to prefetch adjacent pages (previous and next).
 * Useful for bidirectional navigation.
 */
export function usePrefetchAdjacentPages({
  queryKey,
  currentPage,
  totalPages,
  prefetchFn,
  enabled = true,
  staleTime = 1000 * 60 * 2,
}: UsePrefetchPaginationOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const pagesToPrefetch: number[] = [];
    
    // Add next page if not on last page
    if (currentPage < totalPages) {
      pagesToPrefetch.push(currentPage + 1);
    }
    
    // Add previous page if not on first page
    if (currentPage > 1) {
      pagesToPrefetch.push(currentPage - 1);
    }

    pagesToPrefetch.forEach((page) => {
      const pageQueryKey = [...(Array.isArray(queryKey) ? queryKey : [queryKey])];
      const pageIndex = pageQueryKey.findIndex(
        (item) => typeof item === 'number' && item === currentPage
      );
      
      if (pageIndex !== -1) {
        pageQueryKey[pageIndex] = page;
      } else {
        pageQueryKey.push(page);
      }

      const existingData = queryClient.getQueryData(pageQueryKey);
      if (!existingData) {
        queryClient.prefetchQuery({
          queryKey: pageQueryKey,
          queryFn: () => prefetchFn(page),
          staleTime,
        });
      }
    });
  }, [currentPage, totalPages, enabled, queryClient, queryKey, prefetchFn, staleTime]);
}
