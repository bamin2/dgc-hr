import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Pre-warm React Query cache for navigation destinations.
 * Triggered on hover/focus/touch via PrefetchNavLink and MobileActionBar.
 *
 * Only prefetches queries whose cache key matches what the destination page
 * actually reads — otherwise the prefetched entry never gets consumed and we
 * just burn a network request.
 */
export function prefetchRouteData(
  queryClient: QueryClient,
  path: string,
  userId?: string
): void {
  switch (path) {
    case "/requests":
      queryClient.prefetchQuery({
        queryKey: ["unified-requests", undefined],
        staleTime: 30 * 1000,
      });
      break;

    case "/approvals":
      if (userId) {
        queryClient.prefetchQuery({
          queryKey: ["pending-approvals", userId],
          staleTime: 30 * 1000,
        });
      }
      break;

    case "/my-profile":
      if (userId) {
        queryClient.prefetchQuery({
          queryKey: ["my-employee", userId],
          staleTime: 60 * 1000,
        });
      }
      break;

    case "/employees":
    case "/directory":
      // Both pages read the shared employees list cache
      queryClient.prefetchQuery({
        queryKey: queryKeys.employees.all,
        staleTime: 2 * 60 * 1000,
      });
      break;

    case "/notifications":
      if (userId) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.notifications.byUser(userId),
          staleTime: 60 * 1000,
        });
      }
      break;

    case "/":
      // Dashboard data typically already cached from initial load
      break;
  }
}

/**
 * @deprecated Use prefetchRouteData. Kept for backwards compatibility.
 */
export const prefetchMobileRouteData = prefetchRouteData;
