## Goal

When clicking "Create Loan" on the Loans page, first show a small picker:
1. **Internal Staff Loan** — opens the existing form unchanged.
2. **Other Deductions** — opens the same form plus a required "Deduction Name" field (e.g. "Mobile Phone", "Air Ticket"). All other fields (Employee, Amount, Repayment Method, Duration, Start Date, Deduct from Payroll, Auto-Disburse, Notes) stay identical.

Both options write to the same `loans` table; the category is stored so we can tell them apart later (badges, filters, reports — out of scope here, but the data is captured).

## Data model

Add two nullable columns to `public.loans` via migration:
- `category text not null default 'staff_loan'` with a check constraint allowing `'staff_loan'` or `'other_deduction'`.
- `deduction_name text` — required at app level only when `category = 'other_deduction'`.

Existing rows backfill to `'staff_loan'` automatically via the default.

No RLS changes needed (policies already cover the table).

## UI changes

**`src/components/loans/CreateLoanDialog.tsx`**
- Add a first step showing two large selectable cards: "Internal Staff Loan" and "Other Deductions". Each has an icon and short description.
- After a choice is made, render the existing form. If `Other Deductions` is selected, render a required "Deduction Name" text input at the top of the form (above Employee).
- Add a small "Back" affordance in the dialog header to return to the picker.
- Dialog title updates to "New Internal Staff Loan" / "New Other Deduction" depending on choice.
- On submit, include `category` and (when applicable) `deduction_name` in the payload.

**`src/components/loans/RequestLoanDialog.tsx` and `EmployeeRequestLoanDialog.tsx`** — unchanged. Employees only request staff loans; "Other Deductions" is admin-only and lives in the Create flow.

## Hook / type changes

**`src/hooks/useLoans.ts`** — extend the `createLoan` payload type and insert with the two new fields. Default `category` to `'staff_loan'` when not provided so existing call sites keep working.

**`src/types/loans.ts`** — add `category: 'staff_loan' | 'other_deduction'` and optional `deduction_name` to the Loan type.

## Display (light touch)

Where loans are listed (`LoansTable.tsx`, `LoanDetailSheet.tsx`, `MyProfileLoansTab.tsx`, employee profile loans), if `category === 'other_deduction'` show the `deduction_name` as the primary label (falling back to "Loan" / employee name as today). Add a small muted badge "Other Deduction" vs "Staff Loan" so admins can tell them apart at a glance. No filtering, sorting, or analytics changes.

## Out of scope

- No changes to approval workflow, installments engine, payroll deduction logic, or reports.
- No new permissions; whoever can currently create a loan can create either type.
- No changes to the employee-facing "Request Loan" flow.
