# Extend Route Data Prefetching to Desktop Nav

## Why we're skipping the React.memo idea

You called it yourself — wrapping `LazyPage`/`DashboardLazyPage` in `React.memo` won't help. React Router unmounts the previous page when navigating between routes regardless of whether the wrapper memoizes. The Suspense fallback only re-shows when the *chunk* isn't loaded yet — and that's already solved by `PrefetchNavLink` calling `preloadRoute()` on hover/focus. The real lever is **data prefetching**, which today only fires on mobile bottom-nav.

## Current state (verified)

- `src/components/PrefetchNavLink.tsx` already prefetches the **route chunk** on hover/focus via `preloadRoute()`.
- Desktop sidebar (`src/components/dashboard/SidebarSection.tsx`) already uses `PrefetchNavLink` — chunk preloading works on desktop.
- `src/lib/mobileNavPreloader.ts` exists with `prefetchMobileRouteData()` that warms React Query cache for `/requests`, `/approvals`, `/my-profile`. Only called from `MobileActionBar` (bottom nav).
- `src/components/dashboard/MobileNav.tsx` (the burger menu sheet) still uses raw `<Link>` — no chunk or data prefetch.
- Desktop sidebar nav links never trigger data prefetch — chunk loads, then React Query starts cold.

## Changes

### 1. Rename + expand `mobileNavPreloader.ts` → `routeDataPreloader.ts`

New unified preloader that covers desktop routes too. Keep the same shape (sync function, swallows errors via React Query). Add cases for routes with predictable, expensive top-level queries:

```ts
export function prefetchRouteData(
  queryClient: QueryClient,
  path: string,
  userId?: string,
  employeeId?: string,
): void {
  switch (path) {
    case "/":                  // already cached usually
    case "/requests":          // unified-requests
    case "/approvals":         // pending-approvals
    case "/my-profile":        // my-employee
      // existing mobile cases — keep as-is
      break;

    // NEW desktop-relevant cases
    case "/employees":         // queryKeys.employees.all
    case "/time-management":   // pending leave requests
    case "/payroll":           // payroll-runs by location
    case "/loans":             // loans list
    case "/notifications":     // notifications by user
    case "/hiring":            // candidates / offers
    case "/calendar":          // calendar-events for current month
    case "/directory":         // employees (shared key)
      // call queryClient.prefetchQuery with the same key the page hook uses
      break;
  }
}
```

Use the actual `queryKeys.*` factory entries the page hooks use, so prefetched data hits the same cache slot the page reads from. Where the page key is parameterized by the user's employeeId or a date range, accept those as args (already done for `userId`).

Re-export the old `prefetchMobileRouteData` name as an alias so `MobileActionBar` keeps working without an edit, then update its import in a follow-up — or update the import in this same change since it's one line.

### 2. Wire data prefetch into `PrefetchNavLink`

Currently it only calls `preloadRoute(path)`. Extend it to also call `prefetchRouteData(queryClient, path, ...)` on the same hover/focus event. This automatically covers the desktop sidebar (which uses `PrefetchNavLink` everywhere) without touching `SidebarSection.tsx`.

```tsx
// PrefetchNavLink.tsx
const queryClient = useQueryClient();
const { currentUser } = useRole();           // for userId/employeeId

const handleMouseEnter = useCallback((e) => {
  if (prefetch) {
    preloadRoute(path);
    prefetchRouteData(queryClient, path, currentUser?.id, currentUser?.employeeId);
  }
  onMouseEnter?.(e);
}, [...]);
```

Same for `handleFocus`. Idempotent — React Query dedupes by query key, and `preloadRoute` already has its own `prefetchedRoutes` Set guard.

### 3. Convert `MobileNav.tsx` (burger sheet) to use `PrefetchNavLink`

It still uses raw `<Link>`. Swap the inner `<Link>` in `NavItem` for `PrefetchNavLink` so the mobile slide-out menu also benefits from chunk + data prefetching. The avatar `<Link to="/my-profile">` at line 141 too.

### 4. Skip the React.memo wrappers

No change to `LazyPage`/`DashboardLazyPage` in `App.tsx`. Memoization there doesn't address the actual remount cause (route change unmounts the previous element by design).

## Files touched

- `src/lib/mobileNavPreloader.ts` → rename concept to `prefetchRouteData`, add desktop cases (keep file path or rename to `routeDataPreloader.ts`; keep `prefetchMobileRouteData` as alias to avoid churn in `MobileActionBar.tsx`)
- `src/components/PrefetchNavLink.tsx` — call `prefetchRouteData` alongside `preloadRoute`
- `src/components/dashboard/MobileNav.tsx` — swap `<Link>` for `PrefetchNavLink`

No changes to: `App.tsx`, `Sidebar.tsx`, `SidebarSection.tsx`, `MobileActionBar.tsx` (gets the desktop-route additions for free via the alias), or any page hook.

## Behavior after

- Hover a desktop sidebar item → route chunk starts loading + top-level query for that page warms in cache. By the time the user clicks, both code and data are usually ready, eliminating the visible Suspense fallback **and** the post-mount loading skeleton.
- Mobile burger menu items get the same prefetch behavior on touch/focus.
- No extra network when the user doesn't actually hover (event-driven, not eager).
- No risk of stale data — `prefetchQuery` respects the same `staleTime` as the page query.
