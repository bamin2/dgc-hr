

# Add "Add Leave Request" Button for HR/Admin in Leave Requests Tab

## Overview
Add an "Add Leave Request" button in the Leave Requests sub-tab of Time Management. This button is visible only to HR and Super Admin roles. It opens a dialog similar to the existing `AdminAddLeaveDialog` but with an employee selector, and uses `useAllLeaveTypes()` (all types regardless of visibility).

## Changes

### 1. New Component: `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`
Based on the existing `AdminAddLeaveDialog` but with these differences:
- **Employee picker**: Add an employee `Select` dropdown (fetched from employees table) with search
- **All leave types**: Use `useAllLeaveTypes()` instead of `useActiveLeaveTypes()` so hidden types also appear
- **No `employeeId` prop**: The employee is selected inside the dialog
- Same submission logic: inserts directly as `approved`, updates leave balance

### 2. Update: `src/components/timemanagement/LeavesTab.tsx`
- Import `useRole` to check permissions
- Import the new `AdminAddLeaveRequestDialog`
- Add state `isAddLeaveOpen`
- In the Leave Requests tab toolbar (lines 108-126), add an "Add Leave Request" button next to the status filter, conditionally rendered when user `hasRole('hr') || hasRole('admin')`
- Render the dialog at the bottom of the component

### 3. Employee Data
- Use a simple query to fetch employees for the selector: `supabase.from('employees').select('id, first_name, last_name, avatar_url, department:departments(name)').eq('status', 'active').order('first_name')`
- Or reuse an existing employees hook if available

## Technical Details

**Dialog form fields (in order):**
1. Employee selector (searchable select with avatar + name + department)
2. Leave type selector (all types via `useAllLeaveTypes()`)
3. Start date / End date (Popover + Calendar)
4. Half day checkbox (single day only)
5. Days count display
6. Reason/notes textarea

**Role gating:** `useRole().hasRole('hr') || useRole().hasRole('admin')` controls button visibility.

**On submit:** Same pattern as `AdminAddLeaveDialog` - insert with `status: 'approved'`, update leave balance, invalidate queries, show toast.

