

# Standardize Scrollable Command Dropdowns

## Problem
Scrollable dropdowns are implemented inconsistently across the app:
- Some put scroll classes on `CommandGroup`, some on `CommandList`, some on both
- The `CommandList` primitive already has `max-h-[300px] overflow-y-auto` built in, but components override or duplicate this
- Popovers inside Dialogs need `onWheel`/`onTouchMove` stopPropagation to prevent scroll locking — this is only done in one place

## Solution

### 1. Update `CommandList` primitive (`src/components/ui/command.tsx`)
Add `overscroll-contain` to the default `CommandList` styles so every dropdown automatically prevents scroll chaining:
```
"max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain"
```

### 2. Remove redundant scroll classes from individual components
These components add `max-h-[300px] overflow-y-auto` to `CommandGroup` when `CommandList` already handles it:

| File | Change |
|------|--------|
| `src/components/ui/country-select.tsx` | Remove `className="max-h-[300px] overflow-y-auto"` from `CommandGroup` |
| `src/components/ui/currency-select.tsx` | Remove `className="max-h-[300px] overflow-y-auto"` from `CommandGroup` |
| `src/components/settings/approvals/ApprovalSettingsTab.tsx` | Remove `className="max-h-[300px] overflow-y-auto"` from `CommandGroup` |
| `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx` | Remove `className="max-h-[240px] overflow-y-auto overscroll-contain"` from `CommandList` (let primitive default handle it) |

### 3. Add `onWheel`/`onTouchMove` stopPropagation to `PopoverContent` primitive (`src/components/ui/popover.tsx`)
This is the key fix for popovers inside dialogs. Add these handlers directly to the `PopoverContent` component so **all** popovers automatically handle scroll events correctly — no per-component workarounds needed:
```tsx
onWheel={(e) => e.stopPropagation()}
onTouchMove={(e) => e.stopPropagation()}
```
Then remove these same handlers from `AdminAddLeaveRequestDialog.tsx` since they'll be inherited.

### 4. Summary of files changed

| File | What |
|------|------|
| `src/components/ui/command.tsx` | Add `overscroll-contain` to `CommandList` defaults |
| `src/components/ui/popover.tsx` | Add `onWheel`/`onTouchMove` stopPropagation to `PopoverContent` |
| `src/components/ui/country-select.tsx` | Remove redundant scroll classes from `CommandGroup` |
| `src/components/ui/currency-select.tsx` | Remove redundant scroll classes from `CommandGroup` |
| `src/components/ui/phone-input.tsx` | No change needed (already clean) |
| `src/components/ui/multi-select.tsx` | No change needed (already clean) |
| `src/components/settings/approvals/ApprovalSettingsTab.tsx` | Remove redundant scroll classes from `CommandGroup` |
| `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx` | Remove per-component overrides (scroll classes on `CommandList`, stopPropagation on `PopoverContent`) |
| `src/components/dashboard/GlobalSearch.tsx` | No change needed (uses `CommandDialog`, not `Popover`) |

### Result
- Every `CommandList` is scrollable by default with consistent max height and overscroll behavior
- Every `PopoverContent` handles scroll events safely inside modals
- No per-component scroll hacks needed for current or future dropdowns
- New dropdowns built with `Command` + `Popover` will just work

