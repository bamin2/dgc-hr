# Sort employees alphabetically and separate zero-salary employees in payroll wizard

## Changes
Update `src/components/payroll/PayrollRunWizard/SelectEmployeesStep.tsx`:

1. **Alphabetical sort** — Sort all eligible employees by `firstName lastName` (case-insensitive, `localeCompare`).

2. **Split into two sections** — Partition eligible employees into:
   - **Payable** (top section): `netSalary > 0` (or `baseSalary > 0` as fallback). Rendered as today, auto-selected by default.
   - **Not in payroll** (bottom section): salary is 0/missing. Rendered in a visually distinct sub-section with:
     - Header: "Not included in this payroll run"
     - Helper text: *"These employees are excluded because their salary has not been entered in the system. Update their compensation to include them."*
     - Each row is **disabled and unchecked** (no checkbox interaction). Net salary shows as `0` in muted color.
     - Provide a small "Edit salary" hint via link to `/employees/{id}` (uses existing route).

3. **Selection safety** — Update the existing dedupe effect so any zero-salary id that ends up in `selectedIds` (e.g. from a previously saved draft) is automatically removed from the selection. The auto-select-all-on-mount effect only selects payable employees.

4. **Counter** — Header counter "(X of Y selected)" reflects only the payable list, matching what will actually be paid.

## Notes
- No DB or hook changes required. `useEmployeesWithCompensation` already returns `netSalary`.
- The "already paid" hidden banner remains unchanged.
- Sort is also applied to the hidden-employees tooltip list for consistency.
