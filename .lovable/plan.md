
# Remove Floating Action Button from Mobile Experience

## Overview
Remove the floating "+" action button entirely from the mobile experience. All creation actions will be accessible only through the Quick Actions section on the Home screen.

---

## Current State vs Target State

```text
CURRENT:
┌─────────────────────────────────────────────────────────┐
│                    Scrollable Content                   │
│                    (pb-40 = 160px padding)              │
└─────────────────────────────────────────────────────────┘
                           [+]  ← FAB (to be removed)
┌─────────────────────────────────────────────────────────┐
│      Home     Requests    Approvals     Profile         │
└─────────────────────────────────────────────────────────┘

TARGET:
┌─────────────────────────────────────────────────────────┐
│                    Scrollable Content                   │
│                    (pb-24 = 96px padding)               │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│      Home     Requests    Approvals*    Profile         │
└─────────────────────────────────────────────────────────┘
* Approvals only for Manager/HR
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/MobileActionBar.tsx` | Remove FAB, Drawer, dialogs, and related imports/state |
| `src/components/dashboard/DashboardLayout.tsx` | Reduce mobile bottom padding from `pb-40` to `pb-24` |

---

## Technical Changes

### 1. MobileActionBar.tsx - Simplify to Navigation Only

**Remove the following:**

- **Imports to remove:**
  - `useState` (no longer needed)
  - `Plus`, `Calendar`, `Banknote` from lucide-react
  - `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`
  - `RequestTimeOffDialog`, `EmployeeRequestLoanDialog`, `RequestHRDocumentDialog`

- **State variables to remove (lines 51-55):**
  - `sheetOpen`
  - `timeOffOpen`
  - `loanOpen`
  - `hrLetterOpen`

- **Functions to remove:**
  - `handleQuickAction` callback (lines 64-70)
  - `quickActions` array (lines 73-89)

- **JSX to remove:**
  - FAB button (lines 178-196)
  - Drawer component (lines 198-228)
  - Request dialogs (lines 230-233)

**Keep:**
- Navigation tabs (Home, Requests, Approvals, Profile)
- Route prefetching logic
- Role-based Approvals tab visibility
- Badge count on Approvals icon

**Resulting component structure:**
```text
MobileActionBar
└── <nav> (fixed bottom)
    └── <div> (flex container, justify-around)
        ├── Home Link
        ├── Requests Link
        ├── Approvals Link (conditional)
        └── Profile Link
```

### 2. DashboardLayout.tsx - Reduce Bottom Padding

**Change:**
- From: `isMobile && "pb-40"` (160px - needed for FAB overlap)
- To: `isMobile && "pb-24"` (96px - just enough for nav bar + safe area)

**Calculation:**
- Nav bar height: 72px
- Buffer: 24px
- Total: 96px (`pb-24`)

---

## Updated MobileActionBar Structure

After cleanup, the component will be significantly simpler:

```tsx
import { useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, FileText, CheckSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";
import { preloadRoute } from "@/lib/routePreloader";
import { prefetchMobileRouteData } from "@/lib/mobileNavPreloader";
import { useQueryClient } from "@tanstack/react-query";

// Interfaces (NavItem only)
// Navigation items array
// renderNavItem function
// Return: just the nav element
```

---

## Quick Actions Already Configured

The `MobileQuickActionsCard` component already includes the correct 4 base actions:

| Action | Icon | Behavior |
|--------|------|----------|
| Request Time Off | `CalendarPlus` | Opens `RequestTimeOffDialog` |
| Request Loan | `Banknote` | Opens `EmployeeRequestLoanDialog` |
| View Payslip | `Receipt` | Opens `MobilePayslipsSheet` |
| HR Letter | `FileText` | Opens `RequestHRDocumentDialog` |

Plus role-based manager actions (Approvals, Directory) that appear for Manager/HR/Admin users.

No changes needed to `MobileQuickActionsCard` - it's already properly configured.

---

## Mobile Navigation Tab Structure

The navigation already correctly handles role-based visibility:

| Tab | Visibility | Icon |
|-----|------------|------|
| Home | Always | `Home` |
| Requests | Always | `FileText` |
| Approvals | Manager/HR only | `CheckSquare` + badge |
| Profile | Always | `User` |

The `justify-around` flex layout ensures tabs are evenly spaced regardless of count (3 or 4 tabs).

---

## Summary of Removals

From `MobileActionBar.tsx`:
- Remove FAB button element
- Remove Drawer/bottom sheet
- Remove all 3 request dialog instances
- Remove related state variables (4 total)
- Remove quickActions array
- Remove handleQuickAction callback
- Clean up unused imports

From `DashboardLayout.tsx`:
- Reduce padding from `pb-40` to `pb-24`
- Update comment to reflect nav-only spacing

---

## Expected Result

- No floating action button on mobile
- Bottom navigation shows only: Home, Requests, Approvals (role-based), Profile
- Tabs evenly spaced with `justify-around`
- Quick Actions section on Home screen is the primary action area
- Content has appropriate bottom padding (96px) to clear the nav bar
- Cleaner, simpler navigation component with reduced bundle size
