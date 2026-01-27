

# Refine Edit Salary Dialog Spacing and Visual Hierarchy

## Overview

Improve the visual rhythm and spacing of the Edit Salary dialog by reducing excessive dividers, applying consistent section spacing, and improving the treatment of list-based sections (Allowances/Deductions) and the GOSI block.

---

## Current Issues

| Issue | Current State |
|-------|---------------|
| Excessive dividers | 5 `<Separator />` elements between every section |
| Inconsistent section spacing | `space-y-6` (24px) everywhere, no differentiation |
| List sections | No distinction between header row and list items |
| Empty states | Simple text with `py-2`, could be more refined |
| GOSI section | Input, helper text, and contribution not visually grouped |
| Summary section | Internal dividers between gross pay and deductions |
| Footer | Already has `border-t` but could use more breathing room |

---

## Proposed Layout Structure

```text
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ Edit Salary                                                 │
│ Update compensation for John Doe                            │
├─────────────────────────────────────────────────────────────┤
│ BODY (scrollable)                                           │
│                                                             │
│ ┌─ BASIC SALARY SECTION ─────────────────────────────────┐  │
│ │ Basic Salary                                           │  │
│ │ [________________]                                     │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ─────────────────── divider ───────────────────────────────│
│                                                             │
│ ┌─ ALLOWANCES SECTION ───────────────────────────────────┐  │
│ │ Allowances                                    [+ Add]  │  │
│ │ ┌──────────────────────────────────────────────────┐   │  │
│ │ │ Housing Allowance              [____2,000__] [X] │   │  │
│ │ ├──────────────────────────────────────────────────┤   │  │
│ │ │ Transportation                 [______500__] [X] │   │  │
│ │ └──────────────────────────────────────────────────┘   │  │
│ │                                                        │  │
│ │ (or empty state: "No allowances added")                │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ─────────────────── divider ───────────────────────────────│
│                                                             │
│ ┌─ DEDUCTIONS SECTION ───────────────────────────────────┐  │
│ │ Deductions                                    [+ Add]  │  │
│ │ ┌──────────────────────────────────────────────────┐   │  │
│ │ │ Loan Repayment                 [______300__] [X] │   │  │
│ │ └──────────────────────────────────────────────────┘   │  │
│ │                                                        │  │
│ │ (or empty state: "No deductions added")                │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ─────────────────── divider (if GOSI) ────────────────────│
│                                                             │
│ ┌─ GOSI SECTION (visual block) ──────────────────────────┐  │
│ │ GOSI Registered Salary                                 │  │
│ │ [________________]                                     │  │
│ │ Helper text...                                         │  │
│ │                                                        │  │
│ │ ┌────────────────────────────────────────────────────┐ │  │
│ │ │ GOSI Employee Contribution (9.75%)        390 SAR  │ │  │
│ │ └────────────────────────────────────────────────────┘ │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ SUMMARY BOX ──────────────────────────────────────────┐  │
│ │ Basic Salary                              4,000 SAR    │  │
│ │ Total Allowances                         +2,500 SAR    │  │
│ │ Gross Pay                                 6,500 SAR    │  │
│ │ ──────────────────────────────────────────────────     │  │
│ │ GOSI Deduction (9.75%)                     -390 SAR    │  │
│ │ Other Deductions                           -300 SAR    │  │
│ │ Total Deductions                           -690 SAR    │  │
│ │ ──────────────────────────────────────────────────     │  │
│ │ Net Pay                                   5,810 SAR    │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ REASON SECTION ───────────────────────────────────────┐  │
│ │ Reason for Change (Optional)                           │  │
│ │ [____________________________]                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                          (border-t)  │
│                             [Cancel]  [Save Changes]        │
└─────────────────────────────────────────────────────────────┘
```

---

## File to Modify

`src/components/employees/EditSalaryDialog.tsx`

---

## Technical Changes

### 1. DialogBody Section Spacing

**Change:** Update the overall body spacing from `space-y-6` to a larger section gap.

```tsx
// From:
<DialogBody className="space-y-6">

// To:
<DialogBody className="space-y-7">
```

This provides 28px between major sections (closer to 24-32px target).

### 2. Remove Divider After Basic Salary

The divider between Basic Salary and Allowances can stay as it separates the primary input from list sections.

**Keep:** `<Separator />` after Basic Salary (line 269)

### 3. Improve Allowances Section

**Changes:**
- Reduce internal spacing from `space-y-3` to `space-y-3` (keep for header-to-content)
- Improve empty state styling with a bordered container
- Keep row items with current styling but ensure consistent padding

```tsx
{/* Allowances Section */}
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Label className="text-sm font-medium">Allowances</Label>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 text-muted-foreground hover:text-foreground"
      onClick={() => setShowAllowanceDialog(true)}
    >
      <Plus className="h-4 w-4 mr-1" />
      Add
    </Button>
  </div>
  
  {allowances.length === 0 ? (
    <div className="py-3 px-4 text-sm text-muted-foreground text-center border border-dashed rounded-lg">
      No allowances added
    </div>
  ) : (
    <div className="space-y-2 rounded-lg border divide-y">
      {allowances.map((allowance) => (
        <div key={allowance.id} className="flex items-center gap-3 px-3 py-2.5">
          {/* ... row content ... */}
        </div>
      ))}
    </div>
  )}
</div>
```

**Key changes:**
- "Add" button: Change from `variant="outline"` to `variant="ghost"` with muted color
- Empty state: Add dashed border container with centered text
- List container: Use `border` + `divide-y` instead of individual `bg-muted/30 rounded-lg` per row
- Row padding: Change from `p-3` to `px-3 py-2.5` for tighter vertical rhythm

### 4. Remove Separator Between Allowances and Deductions

**Remove:** The `<Separator />` between Allowances and Deductions (line 317)

The sections are visually distinct enough with their own borders.

### 5. Improve Deductions Section

Apply the same pattern as Allowances:

```tsx
{/* Deductions Section */}
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <Label className="text-sm font-medium">Deductions</Label>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 text-muted-foreground hover:text-foreground"
      onClick={() => setShowDeductionDialog(true)}
    >
      <Plus className="h-4 w-4 mr-1" />
      Add
    </Button>
  </div>
  
  {deductions.length === 0 ? (
    <div className="py-3 px-4 text-sm text-muted-foreground text-center border border-dashed rounded-lg">
      No deductions added
    </div>
  ) : (
    <div className="space-y-2 rounded-lg border divide-y">
      {deductions.map((deduction) => (
        <div key={deduction.id} className="flex items-center gap-3 px-3 py-2.5">
          {/* ... row content ... */}
        </div>
      ))}
    </div>
  )}
</div>
```

### 6. GOSI Section - Group as Visual Block

**Keep:** The `<Separator />` before GOSI section

**Change:** Group the GOSI input, helper text, and calculated contribution into a single visual container.

```tsx
{/* GOSI Section */}
{employee.isSubjectToGosi && (
  <>
    <Separator />
    <div className="space-y-4">
      <Label className="text-sm font-medium">GOSI</Label>
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="space-y-1.5">
          <Label htmlFor="gosiSalary" className="text-sm text-muted-foreground">
            Registered Salary
          </Label>
          <Input
            id="gosiSalary"
            type="number"
            min="0"
            step="0.01"
            value={gosiSalary ?? ''}
            onChange={(e) => setGosiSalary(e.target.value ? parseFloat(e.target.value) : null)}
          />
          <p className="text-xs text-muted-foreground">
            The salary registered with GOSI for social insurance calculations
          </p>
        </div>
        {gosiCalculation.gosiDeduction > 0 && (
          <div className="flex justify-between items-center text-sm bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
            <span className="text-muted-foreground">
              Employee Contribution ({gosiCalculation.employeeRate}%)
            </span>
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              {formatAmount(gosiCalculation.gosiDeduction, currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  </>
)}
```

**Key changes:**
- Add section title "GOSI" as a Label
- Wrap input + helper + contribution in a `bg-muted/30 rounded-lg` container
- Add subtle border to the contribution highlight for better definition
- Change input label from "GOSI Registered Salary" to just "Registered Salary" (parent section is "GOSI")

### 7. Remove Separator Before Summary

**Remove:** The `<Separator />` before Summary section (line 397)

The Summary box has its own background which provides visual separation.

### 8. Summary Section - Adjust Internal Spacing

**Change:** Remove the internal `<Separator />` elements and use spacing + font weight instead.

```tsx
{/* Summary Section */}
<div className="bg-muted/50 rounded-lg p-4 space-y-3">
  {/* Gross calculations */}
  <div className="space-y-1.5">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Basic Salary</span>
      <span>{formatAmount(basicSalary, currency)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Total Allowances</span>
      <span className="text-green-600">+{formatAmount(totals.totalAllowances, currency)}</span>
    </div>
    <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/50">
      <span>Gross Pay</span>
      <span>{formatAmount(totals.grossPay, currency)}</span>
    </div>
  </div>
  
  {/* Deductions */}
  <div className="space-y-1.5 pt-2">
    {gosiCalculation.gosiDeduction > 0 && (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">GOSI ({gosiCalculation.employeeRate}%)</span>
        <span className="text-red-600">-{formatAmount(gosiCalculation.gosiDeduction, currency)}</span>
      </div>
    )}
    {totals.otherDeductions > 0 && (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Other Deductions</span>
        <span className="text-red-600">-{formatAmount(totals.otherDeductions, currency)}</span>
      </div>
    )}
    <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/50">
      <span>Total Deductions</span>
      <span className="text-red-600">-{formatAmount(totals.totalDeductions, currency)}</span>
    </div>
  </div>
  
  {/* Net Pay */}
  <div className="flex justify-between font-semibold text-base pt-2 border-t">
    <span>Net Pay</span>
    <span className="text-primary">{formatAmount(totals.netPay, currency)}</span>
  </div>
</div>
```

**Key changes:**
- Group related items (gross calcs, deductions, net pay) into sub-groups
- Use `border-t border-border/50` (subtle) for sub-totals
- Use full `border-t` for Net Pay (strong separation)
- Remove explicit `<Separator />` components
- Add `space-y-1.5` for tighter line spacing within groups
- Increase Net Pay to `text-base` for emphasis

### 9. Reason Section - Tighten Spacing

**Change:** Reduce spacing between label and input.

```tsx
{/* Reason for Change */}
<div className="space-y-1.5">
  <Label htmlFor="reason" className="text-sm">Reason for Change (Optional)</Label>
  <Textarea
    id="reason"
    placeholder="e.g., Annual salary review, Promotion, etc."
    value={reason}
    onChange={(e) => setReason(e.target.value)}
    rows={2}
  />
</div>
```

**Change:** From `space-y-2` to `space-y-1.5`

### 10. Footer Spacing

The DialogFooter already has `pt-4 border-t mt-2` which is good. For extra breathing room, add more top margin to the footer or bottom padding to the body.

**Change:** Add `mt-4` to DialogFooter via className override:

```tsx
<DialogFooter className="mt-4">
  {/* buttons */}
</DialogFooter>
```

---

## Summary of Divider Changes

| Location | Current | New |
|----------|---------|-----|
| After Basic Salary | `<Separator />` | Keep (major section break) |
| After Allowances | `<Separator />` | Remove (list sections self-contained) |
| Before GOSI | `<Separator />` | Keep (major section break) |
| Before Summary | `<Separator />` | Remove (Summary has bg) |
| Inside Summary (2x) | `<Separator />` | Replace with subtle border-t |

**Result:** 5 Separators → 2 Separators + subtle borders

---

## Spacing Summary

| Element | Current | New |
|---------|---------|-----|
| DialogBody sections | `space-y-6` (24px) | `space-y-7` (28px) |
| Section header to content | `space-y-3` (12px) | `space-y-3` (keep) |
| Label to input | `space-y-2` (8px) | `space-y-1.5` (6px) |
| List item rows | `p-3` | `px-3 py-2.5` |
| Summary internal | `space-y-2` | `space-y-1.5` per group |
| Footer margin | `mt-2` | `mt-4` |

---

## Expected Result

- Cleaner visual hierarchy with fewer horizontal dividers
- Allowances and Deductions feel like cohesive list containers
- Empty states are visually distinct and informative
- GOSI section is a clear visual block
- Summary section has better internal grouping
- More breathing room before footer
- Overall dialog feels less cluttered and more organized

