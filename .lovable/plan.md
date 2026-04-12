

# Mobile-Only Visual Refinement Pass

## Summary
A targeted mobile polish pass across the entire app. All changes use responsive prefixes or `useIsMobile()` guards so desktop remains untouched. No component redesigns -- only spacing, overflow, alignment, and touch-target fixes.

## Technical Details

### 1. DashboardLayout (`src/components/dashboard/DashboardLayout.tsx`)
- Increase mobile bottom padding from `pb-24` to `pb-28` to ensure no content hides behind 72px bottom nav + safe area

### 2. Header (`src/components/dashboard/Header.tsx`)
- On mobile, reduce greeting font from `text-lg` to `text-base` for better balance with the compact header height (h-14)
- Tighten right-side gap: change `gap-2` to `gap-1.5` on mobile for avatar/bell alignment

### 3. MobileActionBar (`src/components/dashboard/MobileActionBar.tsx`)
- Add `pb-safe` class to nav for iOS home indicator spacing
- Reduce height from `h-[72px]` to `h-16` for a more standard mobile nav feel
- Add subtle top shadow for visual separation

### 4. BentoGrid / MobileStatusCards / MobileQuickActionsCard
- `MobileStatusCards`: Remove the extra `px-4` wrapper (parent DashboardLayout already provides px-4)
- `MobileGreetingCard`: Remove `px-4` since BentoCard already has p-4
- `MobileQuickActionsCard`: Already well-structured, no changes needed

### 5. PageHeader (`src/components/ui/page-header.tsx`)
- Reduce mobile bottom margin from `mb-6` to `mb-4`
- Ensure actions wrap properly with `flex-wrap` (already present)

### 6. Notifications Page (`src/pages/Notifications.tsx`)
- `NotificationsMetrics`: Already `grid-cols-2` on mobile -- good
- `NotificationsFilters`: Already stacks vertically on mobile -- good
- `TabsList` on notifications: Add `flex-nowrap` to prevent wrapping, keep horizontal scroll
- `NotificationCard`: On mobile, stack the action buttons below content instead of inline. Add `min-w-0` to content div and `truncate` on timestamp row to prevent overflow

### 7. Notifications Card (`src/components/notifications/NotificationCard.tsx`)
- Wrap the badges row with `flex-wrap min-w-0` to prevent horizontal overflow on small screens
- Make timestamp row responsive: hide the full formatted date on mobile, show only relative time

### 8. Directory Page (`src/pages/Directory.tsx`)
- Search input: Remove `max-w-md` on mobile so it takes full width
- Directory grid: Already `grid-cols-1` on mobile -- good
- Pagination buttons: Add `min-h-[44px]` for touch targets

### 9. Business Trips (`src/pages/BusinessTrips.tsx`)
- Tab triggers already hide labels on mobile with `hidden sm:inline` -- good
- No changes needed

### 10. Settings Page (`src/pages/Settings.tsx`)
- Mobile dropdown selector is already implemented -- good
- No changes needed

### 11. Time Off Page (`src/pages/TimeOff.tsx`)
- No changes needed -- tabs scroll, button stacks properly

### 12. Approvals Page (`src/pages/Approvals.tsx`)
- Mobile already redirects to `MobileApprovalsHub` -- good
- `MobileApprovalsHub`: Already has proper px-4 and pb-24

### 13. Requests Page (`src/components/requests/MobileRequestsHub.tsx`)
- Already mobile-optimized with filter pills and full-width cards
- Increase `pb-24` to `pb-28` to match layout bottom padding

### 14. My Profile (`src/components/myprofile/mobile/MobileProfileHub.tsx`)
- Already has `pb-24` -- increase to `pb-28` for consistency
- Already well-structured with section cards

### 15. Global CSS additions (`src/index.css`)
- Add a mobile-only utility to prevent horizontal overflow on the body/main

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/DashboardLayout.tsx` | Increase mobile bottom padding to pb-28 |
| `src/components/dashboard/Header.tsx` | Tighten mobile greeting size and right-side gaps |
| `src/components/dashboard/MobileActionBar.tsx` | Add safe-area padding, reduce height, add top shadow |
| `src/components/dashboard/bento/MobileStatusCards.tsx` | Remove duplicate px-4 padding wrapper |
| `src/components/ui/page-header.tsx` | Reduce mobile bottom margin |
| `src/components/notifications/NotificationCard.tsx` | Fix badge/timestamp overflow on mobile |
| `src/pages/Notifications.tsx` | Ensure tab row doesn't wrap, checkbox alignment |
| `src/pages/Directory.tsx` | Full-width search on mobile, touch-friendly pagination |
| `src/components/requests/MobileRequestsHub.tsx` | Increase bottom padding to pb-28 |
| `src/components/myprofile/mobile/MobileProfileHub.tsx` | Increase bottom padding to pb-28 |

