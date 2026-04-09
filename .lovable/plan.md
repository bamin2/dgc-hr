

# Fix NET_PAY, GROSS_PAY, and TOTAL_DEDUCTIONS to Include Adjustments

## Problem
`NET_PAY`, `GROSS_PAY`, and `TOTAL_DEDUCTIONS` in generated payslips use raw snapshot values from `payroll_run_employees`. These snapshots are taken before one-time adjustments (earnings/deductions from wizard Step 3) and loan installments are applied. The DEDUCTIONS loop correctly includes these items individually, but the aggregate totals don't match.

## Fix
In `generate-payslips/index.ts` (and `preview-payslip-template/index.ts`), compute adjusted totals that include:
- **Adjusted Gross Pay** = snapshot gross_pay + earning adjustments
- **Adjusted Total Deductions** = snapshot total_deductions + deduction adjustments + loan installments
- **Adjusted Net Pay** = adjusted gross - adjusted total deductions

This matches the same logic used by `ReviewFinalizeStep` and `PayrollRegister`.

## Changes

### File: `supabase/functions/generate-payslips/index.ts`
After building the adjustment/loan arrays (~line 575), compute adjusted totals:

```typescript
const earningsAdjTotal = empEarningAdj.reduce((s, a) => s + (Number(a.amount) || 0), 0);
const deductionsAdjTotal = empDeductionAdj.reduce((s, a) => s + (Number(a.amount) || 0), 0);
const loanTotal = empLoanInstallments.reduce((s, li) => s + (Number(li.amount) || 0), 0);

const adjustedGross = (Number(payrollEmployee.gross_pay) || 0) + earningsAdjTotal;
const adjustedDeductions = (Number(payrollEmployee.total_deductions) || 0) + deductionsAdjTotal + loanTotal;
const adjustedNet = adjustedGross - adjustedDeductions;
```

Then use these in tagData:
- `GROSS_PAY` and `TOTAL_EARNINGS` → `adjustedGross`
- `TOTAL_DEDUCTIONS` → `adjustedDeductions`
- `NET_PAY` → `adjustedNet`

### File: `supabase/functions/preview-payslip-template/index.ts`
Same adjustment calculation for the preview function.

## Files to modify

| File | Change |
|------|--------|
| `supabase/functions/generate-payslips/index.ts` | Compute adjusted gross/deductions/net including adjustments and loans |
| `supabase/functions/preview-payslip-template/index.ts` | Same adjusted calculations for preview |

