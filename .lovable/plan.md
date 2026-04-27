# Add Delete/Archive Confirmation Dialog for Employees

## Problem
Clicking "Delete Employee" in the directory triggers deletion immediately. Because most employees have historical records (payroll, salary, etc.), the action silently falls back to archiving — without warning the user first. We need an explicit confirmation that explains exactly what will happen before any change is made.

## Solution
Introduce a single reusable confirmation dialog (`DeleteEmployeeConfirmDialog`) shown when the user clicks "Delete Employee". It clearly explains the two possible outcomes, then proceeds only on confirmation.

### Dialog content
- **Title:** `Delete {First Last}?`
- **Body (two short sections):**
  1. **What will happen** — "This will permanently remove the employee and their personal record. This action cannot be undone."
  2. **If they have historical data** — "If this employee is referenced by payroll runs, salary history, loans, leave requests, or other records, they will instead be **archived** (status set to *Terminated*) and removed from active lists. All historical data will be preserved."
- **Buttons:**
  - Cancel (secondary)
  - **Delete employee** (destructive variant)
- While the mutation runs, the confirm button shows a spinner and is disabled.

### Files to change

1. **New** `src/components/employees/DeleteEmployeeConfirmDialog.tsx`
   - Built on the existing shadcn `AlertDialog` primitives.
   - Props: `open`, `onOpenChange`, `employee`, `onConfirm`, `isLoading`.

2. **`src/pages/Employees.tsx`**
   - Add `deleteTarget: Employee | null` state.
   - Replace direct `onDelete={handleDelete}` with `onDelete={(emp) => setDeleteTarget(emp)}`.
   - Render `<DeleteEmployeeConfirmDialog>` wired to call `handleDelete(deleteTarget)` on confirm and close on success.
   - Pass `isDeleting` from `useEmployeeActions` to drive the loading state.

3. **`src/hooks/useEmployeeActions.ts`** (small)
   - Expose a combined `isDeleting` that is true while either the delete or archive mutation is pending so the dialog button shows the correct state.

### Behavior after confirm
`handleDelete` is unchanged: it tries hard delete, and if blocked by FK references, automatically archives and shows the existing toast explaining the fallback. The confirmation dialog only gates the action; it does not duplicate the post-action toast.

### Notes
- No database changes.
- No new dependencies.
- Uses existing destructive button styling and `AlertDialog` from the design system.
