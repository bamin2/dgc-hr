

# Add Gross Salary to Employee Profile Compensation Card

## Problem
The compensation card in Employee Management → Employee Profile → Employment tab shows Base Salary, then Allowances, then Deductions, then Net Monthly Salary — but does not show a **Gross Salary** subtotal (Base + Allowances) before the deductions section.

## Change

**File:** `src/pages/EmployeeProfile.tsx` (lines 592-619)

Restructure the compensation display order to:

1. **Base Salary** (existing)
2. **Allowances** section with line items (existing)
3. **Gross Monthly Salary** — new row showing `baseSalary + totalAllowances`, styled as a subtotal with a separator and slightly emphasized text
4. **Deductions** section with line items (existing, moved below gross)
5. **Net Monthly Salary** (existing)

The `grossPay` value is already calculated at line 199 (`baseSalary + totalAllowances`), so no logic changes are needed — just add a new display row between allowances and deductions.

### Layout after fix
```text
Base Salary                    X,XXX
─────────────────────────────────────
ALLOWANCES
  Housing                      X,XXX
  Transport                      XXX
─────────────────────────────────────
Gross Monthly Salary           X,XXX  ← NEW
─────────────────────────────────────
DEDUCTIONS
  GOSI (X%)                     -XXX
─────────────────────────────────────
Net Monthly Salary             X,XXX
```

## Files to modify
- `src/pages/EmployeeProfile.tsx` — add Gross Salary row between allowances and deductions

