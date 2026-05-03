# Mobile Requests — restrict loan detail to employee view

## Problem
Two leaks when an employee opens a loan from the mobile Requests tab:

1. **List leak (only visible to HR/Admin who also act as employees).** `useMyLoans` does not filter by `employee_id` — it just selects `*` from `loans` and relies on RLS. RLS hides other employees' rows for plain employees, but HR/Admin pass the `has_any_role` branch and see **every loan in the company** on their personal Requests tab. A regular employee is correctly scoped today, but the hook should not depend on role-aware RLS for a "my requests" query.
2. **Detail leak (visible to all employees).** Tapping a loan opens `LoanDetailSheet`, which unconditionally renders admin actions: **Review**, **Restructure**, **Payment**, **Disburse**, per-installment **Skip / Mark Paid**, and a **Delete Loan** danger zone. An employee can click these even though the underlying mutations will be blocked by RLS — the UI invites failed actions and exposes admin affordances.

## Goal
On the mobile Requests tab, an employee opening a loan sees a clean, read-only detail view: status, amount, schedule, repayment progress, notes, history. No Review / Restructure / Payment / Disburse / Skip / Mark Paid / Delete buttons. HR/Admin behavior on the desktop Loans page is unchanged.

## Approach

### 1. Scope `useMyLoans` to the caller's employee
Resolve the current user's `employee_id` from `employees.user_id = auth.uid()` and add `.eq("employee_id", employee.id)` to the query. Mirrors `useMyRequests` (leave) and `useMyBusinessTrips`. Defense-in-depth — RLS still applies, but the hook no longer hands HR/Admin a company-wide list when they're using their personal Requests view.

### 2. Add a `readOnly` mode to `LoanDetailSheet`
Introduce an optional `readOnly?: boolean` prop on `LoanDetailSheet`. When `true`:
- Hide the entire top action row (Review / Restructure / Payment / Disburse).
- Pass `canMarkPaid={false}` and `canSkip={false}` to `LoanInstallmentsTable` (the table already supports this — the actions column simply collapses).
- Hide the "Danger Zone — Delete Loan" block.
- Keep everything else (status, summary card, progress, notes, schedule, history tab).

### 3. Auto-derive `readOnly` from role at the call site
`MobileRequestDetailSheet` (the only caller introduced for the mobile Requests hub) computes `readOnly` from `useRole()`:
```ts
const { hasRole } = useRole();
const isPrivileged = hasRole('hr') || hasRole('admin');
// ...
<LoanDetailSheet loanId={request.id} open={open} onOpenChange={onOpenChange} readOnly={!isPrivileged} />
```
Desktop `Loans.tsx` continues to render `LoanDetailSheet` without the prop, so HR/Admin behavior is unchanged.

## Files
- **edit** `src/hooks/useLoans.ts` — scope `useMyLoans` to the resolved `employee_id`.
- **edit** `src/components/loans/LoanDetailSheet.tsx` — accept `readOnly` prop; gate top actions, installment actions, and delete zone behind it.
- **edit** `src/components/requests/MobileRequestDetailSheet.tsx` — read role via `useRole()` and pass `readOnly={!hasRole('hr') && !hasRole('admin')}` when rendering `LoanDetailSheet`.

## Out of scope
- No RLS or schema changes — current loan policies already correctly restrict employees to their own rows.
- No changes to leave / business trip / HR document detail surfaces — those already behave correctly (their detail components don't expose admin-only actions to plain employees, and their list hooks are already scoped).
- No change to the desktop Loans page.
