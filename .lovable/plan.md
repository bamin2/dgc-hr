

# Refine Typography Hierarchy

## Overview
Standardize typography across the application to create a calm, refined aesthetic. This involves adjusting font weights, applying `tracking-tight` only to headings, and ensuring metadata uses consistent muted styling.

## Design Specifications

### Typography Rules
```text
Element Type              Weight           Tracking        Color
──────────────────────────────────────────────────────────────────────
Page Titles (h1)          font-semibold    tracking-tight  foreground
Section Headers (h2/h3)   font-semibold    tracking-tight  foreground
Card Titles               font-medium      tracking-tight  foreground
Dialog Titles             font-medium      tracking-tight  foreground
KPI/Metric Values         font-semibold    (none)          foreground
Metadata/Labels           font-medium      (none)          muted-foreground
Helper Text               font-normal      (none)          muted-foreground
```

### Key Changes
- **Card titles**: `font-semibold` → `font-medium`
- **Dialog titles**: `font-semibold` → `font-medium`
- **KPI values**: `font-bold` → `font-semibold` (less aggressive)
- **Report headers**: `font-bold` → `font-semibold`
- **Metadata labels**: Ensure `text-sm text-muted-foreground`
- **tracking-tight**: Only on headings, not on body text or values

## Implementation Plan

### Step 1: Update Core UI Components

**File:** `src/components/ui/card.tsx`

| Component | Current | Updated |
|-----------|---------|---------|
| CardTitle | `text-lg font-semibold leading-none tracking-tight` | `text-lg font-medium leading-none tracking-tight` |

**File:** `src/components/ui/dialog.tsx`

| Component | Current | Updated |
|-----------|---------|---------|
| DialogTitle | `text-lg font-semibold leading-none tracking-tight` | `text-lg font-medium leading-none tracking-tight` |

**File:** `src/components/ui/alert-dialog.tsx`

| Component | Current | Updated |
|-----------|---------|---------|
| AlertDialogTitle | `text-lg font-semibold` | `text-lg font-medium tracking-tight` |

**File:** `src/components/ui/drawer.tsx`

| Component | Current | Updated |
|-----------|---------|---------|
| DrawerTitle | `text-lg font-semibold leading-none tracking-tight` | `text-lg font-medium leading-none tracking-tight` |

### Step 2: Update Design Tokens

**File:** `src/lib/design-tokens.ts`

Update the typography tokens to reflect the refined hierarchy:

```typescript
export const typography = {
  pageTitle: 'text-xl sm:text-2xl font-semibold tracking-tight text-foreground',
  pageSubtitle: 'text-sm sm:text-base text-muted-foreground',
  sectionTitle: 'text-lg font-semibold tracking-tight text-foreground',
  sectionDescription: 'text-sm text-muted-foreground',
  cardTitle: 'text-base font-medium tracking-tight text-foreground',
  body: 'text-sm sm:text-base text-foreground',
  bodySmall: 'text-sm text-foreground',
  helper: 'text-xs text-muted-foreground',
  label: 'text-sm font-medium text-muted-foreground',
  kpiValue: 'text-2xl font-semibold text-foreground',  // New token
} as const;
```

### Step 3: Update KPI/Metric Cards

These files use `text-2xl font-bold` for metric values. Change to `text-2xl font-semibold`:

| File | Location | Change |
|------|----------|--------|
| `src/pages/AuditTrail.tsx` | Lines 131, 139, 149, 159 | `font-bold` → `font-semibold` |
| `src/components/employees/EmployeeLoansTab.tsx` | Lines 105, 116, 127, 142, 149 | `font-bold` → `font-semibold` |
| `src/components/payroll/PayrollRegister.tsx` | Lines 148, 160, 172 | `font-bold` → `font-semibold` |
| `src/components/payroll/PayrollRegister.tsx` | Lines 239, 263 (table totals) | `font-bold` → `font-semibold` |
| `src/components/reports/overview/OverviewMetricCard.tsx` | Line 58 | `font-bold` → `font-semibold` |
| `src/components/hiring/reports/HiringReportsDashboard.tsx` | Lines 23, 34, 45, 56, 72 | `font-bold` → `font-semibold` |
| `src/components/dashboard/admin/LoanExposureCard.tsx` | Line 51 | `font-bold` → `font-semibold` |
| `src/components/team/wizard/bulk-salary/steps/ReviewSummaryStep.tsx` | Line 127 | `font-bold` → `font-semibold` |

### Step 4: Update Report Headers

These files use `text-2xl font-bold tracking-tight` for report titles. Change to `font-semibold`:

| File | Line | Change |
|------|------|--------|
| `src/components/reports/ReportViewer.tsx` | Line 73 | `font-bold` → `font-semibold` |
| `src/components/reports/compliance/ComplianceSnapshotReport.tsx` | Line 105 | `font-bold` → `font-semibold` |
| `src/components/reports/compliance/PayrollVarianceReport.tsx` | Line 111 | `font-bold` → `font-semibold` |
| `src/components/reports/compliance/CTCReport.tsx` | Line 103 | `font-bold` → `font-semibold` |
| `src/pages/HelpCenter.tsx` | Line 21 | `font-bold` → `font-semibold` |

### Step 5: Update TimeTracker Clock

**File:** `src/components/dashboard/TimeTracker.tsx`

The clock display uses `font-bold` on large numbers. This is acceptable for the dramatic time display, but should be `font-semibold` for consistency:

Lines 126, 133, 140: `text-5xl font-bold` → `text-5xl font-semibold`

### Step 6: Update Balance Display

**File:** `src/components/timeoff/RequestTimeOffDialog.tsx`

Line 243: `text-lg font-bold` → `text-lg font-semibold`

### Step 7: Update Auth/Reset Password Pages

**File:** `src/components/auth/ResetPasswordWizard.tsx`

Update all `text-2xl font-bold` occurrences to `text-2xl font-semibold`:
- Lines 132, 180, 188, 238, 283, 360

### Step 8: Update Email Action Result Page

**File:** `src/pages/EmailActionResult.tsx`

Lines 142, 234: `text-2xl font-bold` → `text-2xl font-semibold`

### Step 9: Update TimeOff Day View

**File:** `src/components/timeoff/TimeOffDayView.tsx`

Line 36: `text-2xl font-bold` → `text-2xl font-semibold`

### Step 10: Update CSS Typography Classes

**File:** `src/index.css`

Update the `.text-heading-*` utility classes in the utilities layer:

Current:
```css
.text-heading-1 {
  @apply text-2xl sm:text-[28px] font-semibold leading-tight tracking-tight;
}

.text-heading-2 {
  @apply text-xl sm:text-[22px] font-semibold leading-snug;
}

.text-heading-3 {
  @apply text-lg font-medium leading-normal;
}
```

These are already correct. No changes needed.

## Files to Modify

### Core UI Components
| File | Changes |
|------|---------|
| `src/components/ui/card.tsx` | CardTitle: `font-semibold` → `font-medium` |
| `src/components/ui/dialog.tsx` | DialogTitle: `font-semibold` → `font-medium` |
| `src/components/ui/alert-dialog.tsx` | AlertDialogTitle: `font-semibold` → `font-medium`, add `tracking-tight` |
| `src/components/ui/drawer.tsx` | DrawerTitle: `font-semibold` → `font-medium` |

### Design Tokens
| File | Changes |
|------|---------|
| `src/lib/design-tokens.ts` | Update cardTitle, add kpiValue token |

### KPI/Metric Components
| File | Changes |
|------|---------|
| `src/pages/AuditTrail.tsx` | `font-bold` → `font-semibold` (4 instances) |
| `src/components/employees/EmployeeLoansTab.tsx` | `font-bold` → `font-semibold` (5 instances) |
| `src/components/payroll/PayrollRegister.tsx` | `font-bold` → `font-semibold` (5 instances) |
| `src/components/reports/overview/OverviewMetricCard.tsx` | `font-bold` → `font-semibold` |
| `src/components/hiring/reports/HiringReportsDashboard.tsx` | `font-bold` → `font-semibold` (5 instances) |
| `src/components/dashboard/admin/LoanExposureCard.tsx` | `font-bold` → `font-semibold` |
| `src/components/team/wizard/bulk-salary/steps/ReviewSummaryStep.tsx` | `font-bold` → `font-semibold` |

### Report Components
| File | Changes |
|------|---------|
| `src/components/reports/ReportViewer.tsx` | `font-bold` → `font-semibold` |
| `src/components/reports/compliance/ComplianceSnapshotReport.tsx` | `font-bold` → `font-semibold` |
| `src/components/reports/compliance/PayrollVarianceReport.tsx` | `font-bold` → `font-semibold` |
| `src/components/reports/compliance/CTCReport.tsx` | `font-bold` → `font-semibold` |

### Other Components
| File | Changes |
|------|---------|
| `src/components/dashboard/TimeTracker.tsx` | `font-bold` → `font-semibold` (3 instances) |
| `src/components/timeoff/RequestTimeOffDialog.tsx` | `font-bold` → `font-semibold` |
| `src/components/timeoff/TimeOffDayView.tsx` | `font-bold` → `font-semibold` |
| `src/pages/HelpCenter.tsx` | `font-bold` → `font-semibold` |
| `src/components/auth/ResetPasswordWizard.tsx` | `font-bold` → `font-semibold` (6 instances) |
| `src/pages/EmailActionResult.tsx` | `font-bold` → `font-semibold` (2 instances) |

## Visual Result

```text
Before:                              After:
────────────────────────────────     ────────────────────────────────
Page Title (bold)                    Page Title (semibold)
  Card Title (semibold)                Card Title (medium)
    KPI: 24,500 (bold)                   KPI: 24,500 (semibold)
    Label (medium)                       Label (medium, muted)
    Helper text                          Helper text (muted)

  Aggressive, heavy feel               Calm, refined, breathable
```

## Typography Hierarchy Summary

```text
Level 1: Page Title
  └─ text-xl sm:text-2xl font-semibold tracking-tight

Level 2: Section Title  
  └─ text-lg font-semibold tracking-tight

Level 3: Card/Dialog Title
  └─ text-lg font-medium tracking-tight

Level 4: KPI Values
  └─ text-2xl font-semibold (no tracking)

Level 5: Labels
  └─ text-sm font-medium text-muted-foreground

Level 6: Helper/Meta
  └─ text-xs text-muted-foreground
```

## Technical Notes

- **tracking-tight**: Only applied to headings for a refined, professional look
- **font-bold**: Completely removed from the typography system (too aggressive)
- **font-semibold**: Maximum weight for emphasis (page titles, section headers, KPIs)
- **font-medium**: Default for card/dialog titles and labels
- **font-normal**: Default for body text
- **Muted foreground**: All secondary/meta text uses `text-muted-foreground`

## Unchanged Elements

- Content text and wording
- Layout and spacing
- Component structure
- Color scheme (except ensuring muted-foreground on metadata)

