
# Improve Dialog Layout and Spacing

## Overview
Refine dialog layouts across the application by replacing excessive dividers with spacing, grouping related fields using subtle inner surfaces, and maintaining max height and scrolling behavior. This creates a cleaner, more visually cohesive experience while preserving all form fields and logic.

## Current State Analysis

### Patterns Found
1. **Separator Usage**: Many dialogs use `<Separator />` or `<Separator className="my-6" />` between sections
2. **Divider Lines**: Some use `border-t`, `divide-y` for list separation
3. **Field Grouping**: Most use `space-y-4` with no visual container for related fields
4. **Section Headers**: Text-only headers like `<h3 className="text-sm font-medium text-muted-foreground">`

### Dialogs to Update
Based on the search results, these dialogs use excessive dividers or would benefit from visual grouping:

| Dialog | Location | Current Issue |
|--------|----------|---------------|
| EditSalaryDialog | employees/ | 2 `<Separator />` between sections |
| LeaveTypeFormDialog | timemanagement/ | 6 `<Separator />` between form sections |
| ReviewCorrectionDialog | attendance/ | 1 `<Separator />` between info and form |
| DocumentEditDialog | employees/documents/ | 1 `<Separator />` before notifications |
| CreateTripDialog | business-trips/ | Uses FormSection with `separator` prop + `border-t` in card |
| CreateLoanDialog | loans/ | No separators but needs field grouping |

## Design Specifications

### Visual Grouping Surface
Replace dividers with subtle inner surface containers for related field groups:
```text
Property              Value
──────────────────────────────────────────────────────
Background            bg-white/60 dark:bg-white/5
Border Radius         rounded-xl
Padding               p-4
```

### Section Spacing
```text
Property              Current Value          Updated Value
──────────────────────────────────────────────────────────
Section Gap           space-y-4 + Separator  space-y-6 (no separator)
Inner Field Gap       space-y-4              space-y-4 (keep)
Section Header        text-muted-foreground  font-medium (slightly stronger)
```

### Component Pattern
Create a reusable `DialogSection` component or utility class pattern:
```tsx
// Inner surface for related fields
<div className="bg-white/60 dark:bg-white/5 rounded-xl p-4 space-y-4">
  {/* Related fields */}
</div>
```

## Implementation Plan

### Step 1: Update FormSection Component

**File:** `src/components/ui/form-section.tsx`

Add a new `surface` variant that wraps content in a subtle background:
- Remove the `separator` prop usage pattern
- Add `variant?: "default" | "surface"` prop
- Surface variant applies: `bg-white/60 dark:bg-white/5 rounded-xl p-4`
- Keep the section header outside the surface for hierarchy

### Step 2: Update EditSalaryDialog

**File:** `src/components/employees/EditSalaryDialog.tsx`

Changes:
- Remove `<Separator />` between Basic Salary and Allowances (line 269)
- Remove `<Separator />` before GOSI section (line 371)
- Increase section spacing from `space-y-7` to `space-y-6`
- Wrap Allowances and Deductions sections in surface containers
- Keep the GOSI section and Summary in their existing `bg-muted/30` and `bg-muted/50` containers

### Step 3: Update LeaveTypeFormDialog

**File:** `src/components/timemanagement/LeaveTypeFormDialog.tsx`

Changes:
- Remove all 6 `<Separator />` instances (lines 322, 403, 453, 503, 627)
- Remove `Separator` import
- Increase form spacing to `space-y-6`
- Wrap each section in surface containers:
  - Basic Information fields
  - Leave Rules toggle grid
  - Document Requirements
  - Carryover Settings
  - Salary Deduction Policy
  - Status toggle

### Step 4: Update ReviewCorrectionDialog

**File:** `src/components/attendance/ReviewCorrectionDialog.tsx`

Changes:
- Remove `<Separator />` between employee info and date (line 124)
- Remove `Separator` import
- Increase spacing from `space-y-4` to `space-y-5`
- Wrap "Time Comparison" and "Reason for Correction" in subtle surface

### Step 5: Update DocumentEditDialog

**File:** `src/components/employees/documents/DocumentEditDialog.tsx`

Changes:
- Remove `<Separator />` before expiry notifications (line 214)
- Remove `Separator` import
- Wrap notification settings in a surface container
- Increase spacing from `space-y-4` to `space-y-5`

### Step 6: Update CreateTripDialog

**File:** `src/components/business-trips/CreateTripDialog.tsx`

Changes:
- Remove `separator` prop from FormSection components (lines 238, 315)
- Remove `border-t my-2` divider inside Per Diem card (line 402)
- Keep the existing Per Diem calculation card as-is (already has `bg-muted/50`)

### Step 7: Update CreateLoanDialog

**File:** `src/components/loans/CreateLoanDialog.tsx`

Changes:
- Group related fields with surface containers:
  - Employee + Principal Amount
  - Repayment method + duration/installment
  - Date + toggles
- Increase form spacing from `space-y-4` to `space-y-5`

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/form-section.tsx` | Add surface variant with bg-white/60 styling |
| `src/components/employees/EditSalaryDialog.tsx` | Remove 2 Separators, increase spacing |
| `src/components/timemanagement/LeaveTypeFormDialog.tsx` | Remove 6 Separators, add surfaces to sections |
| `src/components/attendance/ReviewCorrectionDialog.tsx` | Remove 1 Separator, increase spacing |
| `src/components/employees/documents/DocumentEditDialog.tsx` | Remove 1 Separator, add surface |
| `src/components/business-trips/CreateTripDialog.tsx` | Remove separator props, remove border-t |
| `src/components/loans/CreateLoanDialog.tsx` | Add field grouping surfaces |

## Visual Comparison

```text
Before (with dividers):
┌────────────────────────────────────────────┐
│  Basic Salary                              │
│  ┌────────────────────────────────────┐    │
│  │ [Input field]                      │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ──────────────────────────────────────    │  ← Remove divider
│                                            │
│  Allowances                                │
│  ┌────────────────────────────────────┐    │
│  │ [List items]                       │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ──────────────────────────────────────    │  ← Remove divider
│                                            │
│  GOSI                                      │
│  ┌────────────────────────────────────┐    │
│  │ [GOSI settings]                    │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘

After (with spacing + surfaces):
┌────────────────────────────────────────────┐
│  Basic Salary                              │
│  ┌────────────────────────────────────┐    │
│  │ [Input field]                      │    │
│  └────────────────────────────────────┘    │
│                                            │
│                                            │  ← Increased spacing (space-y-6)
│  Allowances                                │
│  ┌─────────────────────────────────────┐   │  ← Subtle surface
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │    bg-white/60
│  │ ░  [List items with proper gap]  ░ │   │    rounded-xl
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │    p-4
│  └─────────────────────────────────────┘   │
│                                            │
│                                            │
│  GOSI                                      │
│  ┌─────────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │  ← Keep existing
│  │ ░  [GOSI settings]               ░ │   │    bg-muted/30
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  └─────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

## Technical Notes

### Surface Styling Rationale
- `bg-white/60`: Semi-transparent white provides subtle elevation without competing with dialog background
- `dark:bg-white/5`: Very subtle lift in dark mode
- `rounded-xl`: Matches card system (16px radius)
- `p-4`: Consistent internal padding

### When to Use Surfaces
- Toggle groups (like Leave Rules with 4 switches)
- Lists with Add buttons (Allowances, Deductions)
- Nested form sections that need visual separation
- Calculation/summary previews

### When NOT to Use Surfaces
- Simple sequential form fields (just use spacing)
- Single standalone fields
- Already-styled containers (like existing bg-muted/50 cards)

### Scrolling Behavior
- All dialogs maintain `max-h-[90vh] overflow-y-auto` on DialogContent or use DialogBody
- No changes to scroll behavior - surfaces are within scrollable content

### Unchanged Elements
- Form field components and logic
- Validation rules
- Button actions and handlers
- Dialog sizes and max-heights
- Existing bg-muted containers (Summary, GOSI, Per Diem cards)
