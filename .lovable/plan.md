
# Normalize Spacing Across Cards and Dialogs

## Overview
Standardize spacing throughout the application to create better breathing room. This involves increasing internal padding, expanding vertical gaps between sections, and preferring spacing over dividers where appropriate.

## Design Specifications

### Spacing Values
```text
Current State                    Updated State
─────────────────────────────    ─────────────────────────────
Card padding: p-4 sm:p-6         Card padding: p-5 sm:p-6
Section gap: gap-4               Section gap: gap-5
Vertical spacing: space-y-4      Vertical spacing: space-y-5
Dialog content: gap-4            Dialog content: gap-5
```

### Philosophy
- Use spacing to create visual separation instead of dividers
- Maintain consistent rhythm across all surfaces
- Keep layouts and card order unchanged

## Implementation Plan

### Step 1: Update Card Base Components

**File:** `src/components/ui/card.tsx`

| Component | Current | Updated |
|-----------|---------|---------|
| CardHeader | `p-4 sm:p-6` | `p-5 sm:p-6` |
| CardContent | `p-4 pt-0 sm:p-6 sm:pt-0` | `p-5 pt-0 sm:p-6 sm:pt-0` |
| CardFooter | `p-4 pt-0 sm:p-6 sm:pt-0` | `p-5 pt-0 sm:p-6 sm:pt-0` |
| CardFooter gap | `gap-4` | `gap-5` |

### Step 2: Update Dialog Components

**File:** `src/components/ui/dialog.tsx`

| Component | Current | Updated |
|-----------|---------|---------|
| DialogContent base | `gap-4` | `gap-5` |
| DialogHeader gap | `gap-1.5` | `gap-2` |
| DialogFooter pt | `pt-4` | `pt-5` |

**File:** `src/components/ui/alert-dialog.tsx`

| Component | Current | Updated |
|-----------|---------|---------|
| AlertDialogContent | `gap-4` | `gap-5` |
| AlertDialogHeader gap | `gap-2` | `gap-2.5` |
| AlertDialogFooter pt | `pt-4` | `pt-5` |

### Step 3: Update ResponsiveDialog

**File:** `src/components/ui/responsive-dialog.tsx`

| Element | Current | Updated |
|---------|---------|---------|
| Mobile header padding | `py-4` | `py-5` |
| Mobile content padding | `py-4` | `py-5` |
| Mobile footer padding | `py-4` | `py-5` |
| Desktop content padding | `py-4` | `py-5` |

### Step 4: Update BentoCard

**File:** `src/components/dashboard/bento/BentoCard.tsx`

BentoCard already uses `p-5` which is appropriate. No changes needed.

### Step 5: Update Dashboard Cards Spacing

Update internal spacing in dashboard cards from `space-y-4` to `space-y-5`:

| File | Change |
|------|--------|
| `src/components/dashboard/personal/MyLeaveBalanceCard.tsx` | `space-y-4` → `space-y-5` |
| `src/components/dashboard/personal/MyLoansCard.tsx` | `space-y-3` → `space-y-4` |
| `src/components/dashboard/team/TeamTimeOffCard.tsx` | Check and update if needed |
| `src/components/dashboard/team/PendingApprovalsCard.tsx` | Check and update if needed |

### Step 6: Update Dialog Form Spacing

Update form content spacing in dialogs:

| File | Current | Updated |
|------|---------|---------|
| `src/components/employees/BankDetailsDialog.tsx` | `space-y-4 py-4` | `space-y-5 py-5` |
| `src/components/projects/CreateProjectDialog.tsx` | `gap-4 py-4` | `gap-5 py-5` |
| `src/components/attendance/AttendanceCorrectionDialog.tsx` | `space-y-4` | `space-y-5` |
| `src/components/timeoff/RequestTimeOffDialog.tsx` | `space-y-5` | Already correct |

### Step 7: Remove Unnecessary Dividers in EditEnrollmentDialog

**File:** `src/components/benefits/EditEnrollmentDialog.tsx`

This dialog has 6+ Separators. Replace most with increased spacing:

- Remove Separator after employee info → use `mb-6` instead
- Remove Separator after plan info → use `mb-6` instead
- Keep Separator before cost summary (visual grouping justified)
- Remove Separator after car park section → use spacing
- Update internal `space-y-6` sections

### Step 8: Update Settings Cards

**File:** `src/components/settings/SettingsCard.tsx`

| Element | Current | Updated |
|---------|---------|---------|
| CardHeader pb | `pb-4` | `pb-5` |

**File:** `src/components/settings/payroll/BanksSection.tsx`

| Element | Current | Updated |
|---------|---------|---------|
| List spacing | `space-y-2` | `space-y-3` |
| Item padding | `p-3` | `p-4` |

### Step 9: Update Payroll Components

**File:** `src/components/payroll/PayrollMetrics.tsx`

| Element | Current | Updated |
|---------|---------|---------|
| Grid gap | `gap-4` | `gap-5` |
| Card content | `p-5` | Already correct |

## Files to Modify

### Core UI Components
| File | Changes |
|------|---------|
| `src/components/ui/card.tsx` | Increase base padding to p-5, gap-5 |
| `src/components/ui/dialog.tsx` | Increase gap-4 to gap-5, header gap, footer pt |
| `src/components/ui/alert-dialog.tsx` | Increase gap and footer spacing |
| `src/components/ui/responsive-dialog.tsx` | Increase py-4 to py-5 throughout |

### Dashboard Cards
| File | Changes |
|------|---------|
| `src/components/dashboard/personal/MyLeaveBalanceCard.tsx` | space-y-4 → space-y-5 |
| `src/components/dashboard/personal/MyLoansCard.tsx` | space-y-3 → space-y-4 |

### Dialog Forms
| File | Changes |
|------|---------|
| `src/components/employees/BankDetailsDialog.tsx` | space-y-4 → space-y-5, py-4 → py-5 |
| `src/components/projects/CreateProjectDialog.tsx` | gap-4 → gap-5, py-4 → py-5 |
| `src/components/attendance/AttendanceCorrectionDialog.tsx` | space-y-4 → space-y-5 |
| `src/components/benefits/EditEnrollmentDialog.tsx` | Remove excess Separators, use spacing |

### Settings
| File | Changes |
|------|---------|
| `src/components/settings/SettingsCard.tsx` | pb-4 → pb-5 |
| `src/components/settings/payroll/BanksSection.tsx` | space-y-2 → space-y-3, p-3 → p-4 |

### Payroll
| File | Changes |
|------|---------|
| `src/components/payroll/PayrollMetrics.tsx` | gap-4 → gap-5 |

## Visual Result

```text
Before:                          After:
┌────────────────────┐           ┌────────────────────┐
│ Header (p-4)       │           │ Header (p-5)       │
├────────────────────┤           │                    │
│ ─────────────────  │           │                    │
│ Content            │           │ Content            │
│ ─────────────────  │           │                    │
│ Content            │           │                    │
│                    │           │ Content            │
└────────────────────┘           │                    │
                                 │                    │
                                 └────────────────────┘
    Tight spacing +                 Breathing room +
    Multiple dividers               Spacing-based separation
```

## Technical Notes

- **Cascading Effect**: Changes to `card.tsx` will propagate to all Card usages automatically
- **Dialog Changes**: Core dialog updates affect all dialogs application-wide
- **Selective Dividers**: Keep dividers only where strong visual separation is semantically needed (e.g., before totals/summaries)
- **Responsive**: Mobile maintains slightly tighter spacing (p-5) while desktop gets more room (sm:p-6)

## Unchanged Elements

- Card order and layout structure
- Grid column configurations
- Component hierarchy
- Mobile/desktop breakpoint behavior
