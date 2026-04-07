

# Fix Payroll Run Total Amount Mismatch

## Problem
The `totalAmount` stored during finalization does not account for one-time adjustments (earnings/deductions from Step 3). It only uses base `netPay` from employee snapshots minus loan deductions. The register view correctly recalculates with adjustments, showing the right number (BHD 34,187.8), but the stored value (BHD 34,202.8) is wrong by 15 — exactly the amount of a "Telephone Deduction" adjustment.

## Fix

**File:** `src/hooks/usePayrollWizard.ts`

In the `finalize` function, include adjustments in the `totalAmount` calculation. The `adjustments` data is already available from `usePayrollRunAdjustments(runId)`.

Change the totalAmount calculation from:
```
const totalAmount = runEmployees.reduce((sum, emp) => sum + (emp.netPay || 0), 0) - loanTotal;
```

To:
```
const earningsAdj = adjustments.filter(a => a.type === 'earning').reduce((sum, a) => sum + a.amount, 0);
const deductionsAdj = adjustments.filter(a => a.type === 'deduction').reduce((sum, a) => sum + a.amount, 0);
const totalAmount = runEmployees.reduce((sum, emp) => sum + (emp.netPay || 0), 0) + earningsAdj - deductionsAdj - loanTotal;
```

This matches the same logic used by the register view's `getAdjustedTotals` function, ensuring the stored total equals the displayed total.

### Files to modify
- `src/hooks/usePayrollWizard.ts` — one line change in `finalize` callback

