

# Fix Loan Deductions Not Reflected in Payroll Review Step

## Problem
Loan installments selected for payroll deduction in Step 3 (Adjustments) are managed entirely within `PayrollLoanInstallments` local state. They are never passed to Step 4 (Review & Finalize), so loan deductions like Muhammad Saleem's 850 are invisible in the final review and not included in the totals.

## Root Cause
`PayrollLoanInstallments` is a self-contained component with internal state (`selections`). It has no callback to bubble selected loan deductions up to the wizard. The `ReviewFinalizeStep` only knows about `adjustments` (one-time adjustments from `usePayrollRunAdjustments`), not loan installments.

## Solution

### 1. Lift loan installment selections out of `PayrollLoanInstallments`

**File:** `src/components/loans/PayrollLoanInstallments.tsx`
- Add an `onLoanDeductionsChange` callback prop that emits the list of included loan deductions (employee ID, amount, employee name, installment details)
- Call this callback whenever selections change

### 2. Pass loan deductions through `AdjustmentsStep`

**File:** `src/components/payroll/PayrollRunWizard/AdjustmentsStep.tsx`
- Add an `onLoanDeductionsChange` callback prop
- Wire it to `PayrollLoanInstallments`

### 3. Store loan deductions in the wizard

**File:** `src/components/payroll/PayrollRunWizard/index.tsx`
- Add state for `loanDeductions` (array of `{employeeId, employeeName, amount, installmentId, description}`)
- Pass the setter to `AdjustmentsStep`
- Pass `loanDeductions` to `ReviewFinalizeStep`

### 4. Include loan deductions in Review totals

**File:** `src/components/payroll/PayrollRunWizard/ReviewFinalizeStep.tsx`
- Accept `loanDeductions` prop
- In `getAdjustedTotals`, add loan deduction amounts to `totalDeductions` and subtract from `netPay`
- Show loan deductions in the per-employee breakdown and the summary section (similar to how one-time adjustments are shown)

## Files Changed

| File | Change |
|------|--------|
| `PayrollLoanInstallments.tsx` | Add `onLoanDeductionsChange` callback |
| `AdjustmentsStep.tsx` | Forward loan deduction callback |
| `PayrollRunWizard/index.tsx` | State for loan deductions, pass to review step |
| `ReviewFinalizeStep.tsx` | Include loan deductions in totals and display |

