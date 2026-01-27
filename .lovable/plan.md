

# Relocate GOSI Salary and Add GOSI Deduction to Calculations

## Overview

This change will:
1. Move the GOSI Registered Salary input field from below Basic Salary to above the summary section
2. Calculate and display the GOSI deduction in the Total Deductions based on the GOSI registered salary and the employee's nationality-based rate

---

## Current Layout vs New Layout

```text
CURRENT:
┌────────────────────────────────────────┐
│ Basic Salary                           │
│ [________________]                     │
├────────────────────────────────────────┤
│ GOSI Registered Salary                 │  ← Currently here
│ [________________]                     │
├────────────────────────────────────────┤
│ Allowances                         Add │
│ • Housing: 2,000                       │
├────────────────────────────────────────┤
│ Deductions                         Add │
│ • Other: 500                           │
├────────────────────────────────────────┤
│ Summary Box                            │  ← GOSI not included in deductions
└────────────────────────────────────────┘

NEW:
┌────────────────────────────────────────┐
│ Basic Salary                           │
│ [________________]                     │
├────────────────────────────────────────┤
│ Allowances                         Add │
│ • Housing: 2,000                       │
├────────────────────────────────────────┤
│ Deductions                         Add │
│ • Other: 500                           │
├────────────────────────────────────────┤
│ GOSI Registered Salary                 │  ← Moved here
│ [________________]                     │
│ GOSI Deduction: 390 SAR (9.75%)        │  ← New: Shows calculated deduction
├────────────────────────────────────────┤
│ Summary Box                            │
│ Basic Salary:       4,000 SAR          │
│ Total Allowances:  +2,000 SAR          │
│ Gross Pay:          6,000 SAR          │
│ ────────────────────────────────       │
│ GOSI Deduction:      -390 SAR          │  ← New line
│ Other Deductions:    -500 SAR          │
│ Total Deductions:    -890 SAR          │  ← Now includes GOSI
│ ────────────────────────────────       │
│ Net Pay:            5,110 SAR          │
└────────────────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/employees/EditSalaryDialog.tsx`

### 1. Add Work Locations Hook

Import and use the `useWorkLocations` hook to fetch GOSI rates:

```typescript
import { useWorkLocations, GosiNationalityRate } from "@/hooks/useWorkLocations";
import { getCountryCodeByName } from "@/data/countries";
```

Inside the component:
```typescript
const { data: workLocations } = useWorkLocations();
```

### 2. Calculate GOSI Deduction Amount

Add a new `useMemo` to calculate the GOSI deduction based on:
- The employee's work location GOSI settings
- The employee's nationality
- The entered GOSI registered salary

```typescript
const gosiCalculation = useMemo(() => {
  if (!employee.isSubjectToGosi || !gosiSalary) {
    return { gosiDeduction: 0, employeeRate: 0 };
  }
  
  const employeeWorkLocation = workLocations?.find(loc => loc.id === workLocationId);
  if (!employeeWorkLocation?.gosi_enabled) {
    return { gosiDeduction: 0, employeeRate: 0 };
  }
  
  const rates = employeeWorkLocation.gosi_nationality_rates || [];
  const nationalityCode = getCountryCodeByName(employee.nationality || '');
  const matchingRate = rates.find(r => r.nationality === nationalityCode);
  
  if (!matchingRate) {
    return { gosiDeduction: 0, employeeRate: 0 };
  }
  
  const employeeRate = matchingRate.employeeRate ?? 0;
  const gosiDeduction = (gosiSalary * employeeRate) / 100;
  
  return { gosiDeduction, employeeRate };
}, [employee.isSubjectToGosi, employee.nationality, gosiSalary, workLocationId, workLocations]);
```

### 3. Update Totals Calculation

Modify the `totals` useMemo to include GOSI deduction:

```typescript
const totals = useMemo(() => {
  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const otherDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const grossPay = basicSalary + totalAllowances;
  const totalDeductions = otherDeductions + gosiCalculation.gosiDeduction;
  const netPay = grossPay - totalDeductions;
  return { 
    totalAllowances, 
    otherDeductions, 
    totalDeductions, 
    grossPay, 
    netPay 
  };
}, [basicSalary, allowances, deductions, gosiCalculation.gosiDeduction]);
```

### 4. Relocate GOSI Salary Section in JSX

Move the GOSI Registered Salary section from after Basic Salary to after Deductions section (before the Summary box).

**Remove from lines 238-254** (after Basic Salary)

**Add after Deductions section (after line 349):**

```tsx
{/* GOSI Section - Above Summary */}
{employee.isSubjectToGosi && (
  <>
    <Separator />
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="gosiSalary">GOSI Registered Salary</Label>
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
        <div className="flex justify-between items-center text-sm bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg">
          <span className="text-muted-foreground">
            GOSI Employee Contribution ({gosiCalculation.employeeRate}%)
          </span>
          <span className="text-amber-700 dark:text-amber-400 font-medium">
            {formatAmount(gosiCalculation.gosiDeduction, currency)}
          </span>
        </div>
      )}
    </div>
  </>
)}
```

### 5. Update Summary Section

Update the summary section to show GOSI deduction separately before other deductions:

```tsx
{/* Summary Section */}
<div className="bg-muted/50 rounded-lg p-4 space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">Basic Salary</span>
    <span>{formatAmount(basicSalary, currency)}</span>
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">Total Allowances</span>
    <span className="text-green-600">+{formatAmount(totals.totalAllowances, currency)}</span>
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">Gross Pay</span>
    <span className="font-medium">{formatAmount(totals.grossPay, currency)}</span>
  </div>
  <Separator />
  {gosiCalculation.gosiDeduction > 0 && (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">GOSI Deduction ({gosiCalculation.employeeRate}%)</span>
      <span className="text-red-600">-{formatAmount(gosiCalculation.gosiDeduction, currency)}</span>
    </div>
  )}
  {totals.otherDeductions > 0 && (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">Other Deductions</span>
      <span className="text-red-600">-{formatAmount(totals.otherDeductions, currency)}</span>
    </div>
  )}
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">Total Deductions</span>
    <span className="text-red-600">-{formatAmount(totals.totalDeductions, currency)}</span>
  </div>
  <Separator />
  <div className="flex justify-between font-semibold">
    <span>Net Pay</span>
    <span className="text-primary">{formatAmount(totals.netPay, currency)}</span>
  </div>
</div>
```

---

## Summary of Changes

| Location | Change |
|----------|--------|
| Imports | Add `useWorkLocations`, `getCountryCodeByName` |
| New `useMemo` | Add `gosiCalculation` for GOSI deduction calculation |
| Totals `useMemo` | Include GOSI deduction in total deductions |
| JSX structure | Move GOSI salary input to after Deductions section |
| Summary section | Show GOSI deduction as separate line item |

---

## Data Flow

```text
gosiSalary state changes
         │
         ▼
gosiCalculation useMemo recalculates
├── Looks up work location GOSI settings
├── Finds nationality-based rate
└── Calculates: gosiSalary × employeeRate / 100
         │
         ▼
totals useMemo recalculates
├── totalDeductions = otherDeductions + gosiDeduction
└── netPay = grossPay - totalDeductions
         │
         ▼
UI re-renders with updated values
```

---

## Expected Result

- GOSI Registered Salary field appears after the Deductions section, just above the summary
- When GOSI salary is entered, the calculated GOSI deduction is shown inline
- The summary box shows GOSI deduction as a separate line
- Total Deductions correctly includes both GOSI and other deductions
- Net Pay is calculated correctly with all deductions

