import { QueryClient } from "@tanstack/react-query";

/**
 * Pre-warm React Query cache for mobile navigation destinations.
 * Called on touch/hover to reduce data loading delay on tab switch.
 */
export function prefetchMobileRouteData(
  queryClient: QueryClient,
  path: string,
  userId?: string
): void {
  switch (path) {
    case "/requests":
      // Pre-warm unified requests data
      queryClient.prefetchQuery({
        queryKey: ["unified-requests", undefined],
        staleTime: 30 * 1000,
      });
      break;

    case "/approvals":
      // Pre-warm pending approvals data
      if (userId) {
        queryClient.prefetchQuery({
          queryKey: ["pending-approvals", userId],
          staleTime: 30 * 1000,
        });
      }
      break;

    case "/my-profile":
      // Pre-warm employee profile data
      if (userId) {
        queryClient.prefetchQuery({
          queryKey: ["my-employee", userId],
          staleTime: 60 * 1000,
        });
      }
      break;

    case "/":
      // Dashboard data typically already cached from initial load
      break;
  }
}
