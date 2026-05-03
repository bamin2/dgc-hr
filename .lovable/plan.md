## Problem

There are **three competing breakpoint definitions** and **two different `useIsMobile` hooks with the same name**:

| Hook / file | "Mobile" threshold |
|---|---|
| `src/hooks/use-mobile.tsx` → `useIsMobile` | `< 768px` |
| `src/hooks/use-media-query.ts` → `useIsMobile` | `≤ 640px` |
| `MobileRestrictedRoute`, `MyProfile`, `Settings`, `Approvals` | `≤ 1023px` |
| `ResponsiveDialog` | `≤ 640px` |

Tailwind defaults are `sm=640`, `md=768`, `lg=1024`. Same-named hook in two files makes imports a coin flip — `EmployeeTable`, `LoansTable`, `PayrollTable` import from `use-media-query` (640), while `DashboardLayout`, `DashboardRenderer`, `AnimatedRoutes`, `Header` import from `use-mobile` (768).

Concrete consequences in the 641–1023 px range (small tablets, foldables, narrow windows):
- `DashboardLayout` shows the **desktop** sidebar (≥768) but `MobileRestrictedRoute` blocks pages as if they were on **mobile** (<1024).
- `MyProfile`/`Settings` render their **mobile** layout, but `ResponsiveDialog` opens as a **desktop** modal instead of a sheet.
- Tables flip to card view at different widths than the layout flips to mobile nav.

## Goal

One canonical breakpoint system aligned to Tailwind defaults, used everywhere.

```text
mobile:  < 768px   (Tailwind md-)        → bottom nav, sheets, card lists
tablet:  768–1023  (md to lg-)           → sidebar collapses, dialogs allowed, restricted features still blocked
desktop: ≥ 1024px  (lg+)                 → full sidebar + all features
```

Restricted-feature pages (Payroll, Reports, Audit, Bulk Salary) keep their `< 1024` block — that's a **feature gate**, not the same concept as "is mobile". It will use a separate, explicitly named hook.

## Changes

### 1. Consolidate to a single hook file: `src/hooks/use-media-query.ts`

Replace its current contents with:

```ts
export function useMediaQuery(query: string): boolean { /* unchanged */ }

// Canonical breakpoints — match Tailwind sm/md/lg
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");   // < md
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

// Feature gate: blocks pages on anything below desktop
export const useIsBelowDesktop = () => useMediaQuery("(max-width: 1023px)");
```

### 2. Delete `src/hooks/use-mobile.tsx`

Re-point every importer to `@/hooks/use-media-query`:

- `src/components/dashboard/Header.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/AnimatedRoutes.tsx`
- `src/components/dashboard/DashboardRenderer.tsx`
- `src/components/dashboard/DashboardLayout.tsx`

These currently use the 768 threshold — the new `useIsMobile` (also 768) preserves their behavior exactly.

### 3. Update the `<= 1023` callsites to use `useIsBelowDesktop`

These four files conflate "mobile" with "below desktop". Rename the local variable to `isBelowDesktop` and import the new hook:

- `src/components/auth/MobileRestrictedRoute.tsx`
- `src/pages/MyProfile.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Approvals.tsx`

Behavior is unchanged; the name now matches the intent (this is a feature/layout gate, not a mobile detection).

### 4. Fix `ResponsiveDialog` to use the tablet+ threshold

`src/components/ui/responsive-dialog.tsx` currently uses `(max-width: 640px)`, so a 720 px tablet shows the desktop modal alongside mobile nav. Change to:

```ts
const isMobile = useIsMobile(); // < 768
```

This aligns dialog vs. sheet rendering with the rest of the layout switch.

### 5. Sweep stale `useIsMobile` from `use-media-query` callers

The following already import from `use-media-query` and got the 640 threshold; they will now get 768. Visually verify no regressions in card/table flip:
- `src/components/employees/EmployeeTable.tsx`
- `src/components/loans/LoansTable.tsx`
- `src/components/payroll/PayrollTable.tsx`

Tables already render in mobile cards under 768 in the dashboard layout, so this aligns them with the navigation switch instead of being one breakpoint behind.

## Verification

After the changes:

```bash
rg "use-mobile" src/                       # → no matches
rg "max-width: 640px"  src/                # → no matches outside index.css
rg "max-width: 1023px" src/                # → no matches; replaced by useIsBelowDesktop
rg "useIsMobile|useIsTablet|useIsDesktop|useIsBelowDesktop" src/ | rg -v use-media-query.ts
```

Manual checks at viewport widths 600, 720, 900, 1100:
- 600 → mobile nav, sheets, card tables.
- 720 → mobile nav, sheets, card tables (was previously a mixed state).
- 900 → desktop sidebar, dialogs, table view, restricted pages still blocked.
- 1100 → full desktop, all features.

## Technical notes

- All thresholds are picked to match Tailwind's default `md` (768) and `lg` (1024) so CSS class breakpoints (`md:`, `lg:`) and JS hook checks agree.
- The `useIsMobile` rename in `use-media-query.ts` (640 → 768) is a behavior change for `EmployeeTable`/`LoansTable`/`PayrollTable`. This is the intended fix; the inconsistency was the bug.
- No route or RLS changes; purely client breakpoint normalization.
