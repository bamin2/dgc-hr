

# Fix Loan Deductions Missing from Finalized Payroll View

## Problem
Loan deductions selected during the payroll wizard (Step 3) exist only in React component state. When finalization happens, two things are broken:
1. **Finalization doesn't persist loan deductions** — `usePayrollWizard.finalize()` doesn't mark loan installments as paid or store the loan deduction data
2. **PayrollRegister (view) doesn't fetch loan deductions** — after finalization, the register view only reads `payroll_run_employees` and `payroll_run_adjustments`, ignoring loan installments linked to the run

## Solution

### 1. Persist loan deductions during finalization

**Files:** `src/hooks/usePayrollWizard.ts`, `src/components/payroll/PayrollRunWizard/index.tsx`

- Pass `loanDeductions` into the `finalize` function
- During finalization, call `useMarkInstallmentsPaidByPayroll` to mark selected loan installments as paid with `paid_in_payroll_run_id = runId`
- Adjust `totalAmount` calculation to subtract loan deduction totals from net pay

### 2. Fetch loan deductions in the register view

**File:** `src/components/payroll/PayrollRegister.tsx`

- Query `loan_installments` where `paid_in_payroll_run_id = run.id` and join with `loans` to get `employee_id` and employee name
- Include loan deduction amounts in `getAdjustedTotals` (add to `totalDeductions`, subtract from `netPay`)
- Add a "Loan Deductions" column or include loan amounts in the "Other Ded." column
- Display a loan deductions summary section (similar to the existing adjustments section)

### 3. Wire loan deductions from wizard to finalize

**File:** `src/components/payroll/PayrollRunWizard/index.tsx`

- Pass `loanDeductions` state to `actions.finalize()` call
- Update the finalize button's onClick to pass the current loan deductions

**File:** `src/hooks/usePayrollWizard.ts`

- Update `finalize` to accept `loanDeductions` parameter
- Use `useMarkInstallmentsPaidByPayroll` mutation inside finalize
- Recalculate `totalAmount` accounting for loan deductions

## Technical Details

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/usePayrollWizard.ts` | Accept loan deductions in `finalize`, mark installments as paid, adjust total |
| `src/components/payroll/PayrollRunWizard/index.tsx` | Pass `loanDeductions` to `actions.finalize()` |
| `src/components/payroll/PayrollRegister.tsx` | Fetch loan installments by `paid_in_payroll_run_id`, include in totals and display |

### Data flow after fix

```text
Wizard Step 3 → loanDeductions state
    ↓
Finalize → mark loan_installments as paid (paid_in_payroll_run_id = runId)
    ↓
Register View → query loan_installments WHERE paid_in_payroll_run_id = runId
    → include in deductions totals and per-employee breakdown
```

