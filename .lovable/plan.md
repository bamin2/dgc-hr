

# Move GOSI Toggle from Employee Edit Form to Compensation Edit Dialog

## Problem
The "Subject to GOSI" toggle and GOSI registered salary fields are currently in the general employee edit form (`EmployeeForm.tsx`). They belong in the compensation edit dialog (`EditSalaryDialog.tsx`) since GOSI is a compensation concern.

## Changes

### 1. Remove GOSI section from `EmployeeForm.tsx`
- Remove the entire "GOSI Settings" block (lines 627-665): the toggle, registered salary input, and description text
- Remove the GOSI confirmation `AlertDialog` (lines 680-709)
- Remove related state variables (`gosiConfirmOpen`, `pendingGosiValue`) and handler functions (`handleGosiToggle`, `confirmGosiChange`, `cancelGosiChange`)
- Remove `isSubjectToGosi` and `gosiRegisteredSalary` from `formData` and from the `onSave` payload
- Keep the `Switch` import only if used elsewhere; otherwise remove it

### 2. Add GOSI toggle to `EditSalaryDialog.tsx`
- Add a "Subject to GOSI" toggle with confirmation dialog (same pattern as current `EmployeeForm`)
- Add local state: `isSubjectToGosi` (initialized from `employee.isSubjectToGosi`)
- Place the toggle above the existing GOSI registered salary section
- When toggled ON: show the registered salary input (already exists)
- When toggled OFF: hide the salary input and clear `gosiSalary`
- Include the confirmation `AlertDialog` for toggling GOSI on/off
- Update `handleSave` to include `isSubjectToGosi` in the update payload
- Update `useUpdateCompensation` to persist `is_subject_to_gosi` to the `employees` table

### 3. Update `useUpdateCompensation.ts`
- Add `isSubjectToGosi?: boolean` to `UpdateCompensationInput`
- In the immediate update path, include `is_subject_to_gosi` in the employee update query when the field is provided

## Technical Details

**Files to modify:**
- `src/components/employees/EmployeeForm.tsx` — remove GOSI section
- `src/components/employees/EditSalaryDialog.tsx` — add GOSI toggle + confirmation
- `src/hooks/useUpdateCompensation.ts` — persist GOSI flag

The GOSI section in the Edit Salary dialog will appear between the Deductions section and the Summary, with the toggle controlling visibility of the registered salary input and the existing GOSI calculation display.

