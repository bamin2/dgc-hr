## Goal

In the Payroll Run wizard, the **Select Employees** step should hide any employee who already has a finalized payslip in another payroll run that overlaps the same period and location. This prevents accidentally paying the same person twice for the same month.

## Behavior

- An employee is hidden when there exists **another** payroll run such that:
  - same `location_id` as the current run, and
  - status is `finalized` or `payslips_issued` (i.e. not `draft`), and
  - its `pay_period_start..pay_period_end` overlaps the wizard's selected period, and
  - the employee already appears in `payroll_run_employees` for that run.
- The current draft run being edited is excluded from the check (so resuming a draft never hides its own employees).
- Hidden employees are also removed from the auto-selected list when entering the step, so they cannot be silently included.
- A small note appears under the header: "X employee(s) hidden — already paid for this period." with a tooltip listing names, so HR understands why the count differs from total active employees.

## Implementation

**New hook** — `src/hooks/useEmployeesAlreadyPaidInPeriod.ts`
- Inputs: `locationId`, `payPeriodStart`, `payPeriodEnd`, `excludeRunId`.
- Queries `payroll_runs` for overlapping non-draft runs at the same location, then `payroll_run_employees` for those run IDs.
- Returns a `Set<string>` of employee IDs and an array of `{ employeeId, runPeriod }` for the tooltip.

**`src/components/payroll/PayrollRunWizard/SelectEmployeesStep.tsx`**
- Accept new props: `payPeriodStart`, `payPeriodEnd`, `excludeRunId`.
- Call the new hook; filter `employees` to drop already-paid IDs.
- Update auto-select effect to only auto-select the visible (eligible) employees.
- If any are hidden, show an info line above the list with the count.

**`src/components/payroll/PayrollRunWizard/index.tsx`**
- Pass `state.payPeriodStart`, `state.payPeriodEnd`, and `state.runId` into `SelectEmployeesStep`.

## Out of scope

- No changes to the database schema, RLS, edit-run flow, or the finalize step.
- No retroactive cleanup of existing draft runs that may already include duplicates — only new selections are filtered. (If you want, I can also strip already-paid employees from an existing draft on entry; tell me and I'll add it.)
