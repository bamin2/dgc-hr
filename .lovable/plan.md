## Root cause

The Postgres delete is being rejected (HTTP 409, error `23503`) because the employee "Testing Testing" is still referenced by **`salary_update_batch_employees`** through a foreign key with `ON DELETE NO ACTION`. The UI just reports the generic message; the real reason is in the network response:

> `update or delete on table "employees" violates foreign key constraint "salary_update_batch_employees_employee_id_fkey"`

For this specific employee there is also 1 row in `salary_history` and 1 row in `audit_logs`, but those FKs already cascade so they are not the blocker.

The fix needs to handle two separate problems:

1. **The data problem** — there are operational/historical tables that legitimately reference an employee but are not allowed to silently follow a delete. The clean answer is to refuse to delete the employee and instead offer to **archive (soft-delete)** them — same effect for the user (they disappear from active lists, payroll, selectors), but historical records remain intact and accurate.
2. **The UX problem** — when a delete fails for FK reasons we currently show a useless generic toast. Even after the change above, admins still need a clear message when something blocks the action.

## Proposed solution

### 1. Prefer archive over hard delete (recommended primary fix)

The `employees` table already has a `status` column (values include `active`, `resigned`, `terminated`). Many references to an employee are by design permanent (payroll runs, salary history, audit logs) — hard-deleting them would corrupt history. The standard pattern is:

- Change the employee row's "Delete" action to call an **Archive** flow that sets `status = 'terminated'` (or a new `'archived'` value if you prefer) and clears the active flag. The employee then no longer appears in active employee lists, payroll selection, approver pickers, etc.
- Keep a separate **Permanently delete** option, visible only when the employee has zero "blocking" references (no payroll runs, no salary batches, no loans, no historical records). When references exist, the option is disabled with a tooltip explaining why and listing the categories ("Has 1 payroll run, 2 loans, …").
- For "Testing Testing" specifically, the user can either archive immediately, or — since this is clearly test data — also remove the single salary-batch row first and then permanently delete. We will offer both options in the UI.

### 2. Show the real reason when a delete is blocked

Update `useDeleteEmployee` (or wherever the mutation lives) to:

- Detect Postgres error code `23503` and parse `error.details` for the referencing table name.
- Translate the table name into a friendly label (map `salary_update_batch_employees` → "Salary update batch", `payroll_run_employees` → "Payroll run", `loans` → "Loan", etc.).
- Surface a toast like: *"Cannot delete Testing Testing — they are referenced by Salary update batch. Archive instead?"* with an Archive button.

### 3. One-click cleanup for this specific employee (optional)

Because "Testing Testing" looks like leftover test data, also expose a "Force delete (remove all related data)" admin action, gated to Super Admin, that:

- Deletes the rows from `salary_update_batch_employees`, `payroll_run_adjustments`, `payroll_run_employees`, `attendance_corrections` (where this employee is hr_reviewer/manager), and any other tables with `NO ACTION` FKs.
- Then deletes the employee row.
- Wraps everything in a single Postgres function (`force_delete_employee(uuid)`) called via RPC so it's atomic.

This is destructive, so it should only be exposed to Super Admins and require a typed confirmation of the employee's name.

## Scope of code changes

- **Hook: `src/hooks/useEmployees.ts`** (or wherever the delete mutation is) — improve error handling, parse FK errors, expose `archiveEmployee` and (admin-only) `forceDeleteEmployee` mutations.
- **Edge function or DB function:** add `force_delete_employee(uuid)` SECURITY DEFINER, callable only by `admin` role.
- **UI: employee row actions menu** — replace the single "Delete" with: "Archive employee" (default) and, when allowed, "Permanently delete". Keep the existing confirmation dialog, but enrich it with the references summary.
- **UI: error toast** — show the translated reason on FK failures, with an Archive shortcut.

## What I will NOT do without your sign-off

- I will not silently change any `ON DELETE` rules to `CASCADE` on tables like `payroll_run_employees`, `salary_history`, or `loans` — that would let a delete wipe finalized payroll/financial history, which is almost never what you want.
- I will not auto-delete "Testing Testing" — once the new flow is in place you can choose Archive or Force-delete from the UI.

## Quick alternative if you want the immediate unblock only

If you just want "Testing Testing" gone right now and don't want the broader UX work, I can run a one-off migration that deletes the single `salary_update_batch_employees` row pointing at this employee and then deletes the employee. Tell me which you'd like and I'll proceed accordingly.
