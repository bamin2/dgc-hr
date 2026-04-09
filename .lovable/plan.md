

# Fix Loan Deductions Not Appearing in Generated Payslips

## Problem
The query fetching loan installments in both `generate-payslips` and `preview-payslip-template` selects a non-existent column `loan_type` from the `loans` table:

```typescript
.select("*, loan:loans(employee_id, loan_type)")
```

The `loans` table has no `loan_type` column. PostgREST returns an error for this relation, causing `paidLoanInstallments` to be null or each item's `loan` to be null. As a result, `li.loan?.employee_id` is always undefined, no installments match any employee, and the DEDUCTIONS loop never includes loan repayments.

Omar Alraee's installment (BHD 255) is correctly marked as `paid` with the right `paid_in_payroll_run_id`, but the payslip generation silently skips it due to the broken query.

## Fix
Remove `loan_type` from the select — only `employee_id` is needed for matching. Use a hardcoded label "Loan Repayment" since there's no loan type field.

### File: `supabase/functions/generate-payslips/index.ts`
- Change `.select("*, loan:loans(employee_id, loan_type)")` to `.select("*, loan:loans(employee_id)")`
- Change `li.loan?.loan_type || "Loan"` to `"Loan"`

### File: `supabase/functions/preview-payslip-template/index.ts`
- Same two changes

## Files to modify

| File | Change |
|------|--------|
| `supabase/functions/generate-payslips/index.ts` | Remove `loan_type` from select, fix label |
| `supabase/functions/preview-payslip-template/index.ts` | Same fix |

