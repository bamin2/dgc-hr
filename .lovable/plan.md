

The user provided the column headers from the Excel file. Now I have what I need to plan the import. Let me also note: only rows with Status = "Added by HR" or "Approved" should be imported.

## Column mapping
- **Emp. No.** → match to `employees.employee_code`
- **Transaction Type** → match to `leave_types.name`
- **From Date** → `start_date`
- **To Date** → `end_date`
- **No. of Days** → `days_count`
- **Status** → filter only "Added by HR" or "Approved" → all imported as `approved`
- **Received On** → `created_at` (submission date)
- Ignored: Emp. Name, Employee Full Name, Position, Work Location, Department, Resumption Date

## Remaining clarifications I'll make sensible defaults for
- **Employee match**: by Emp. No. (Employee Code). Rows with unknown codes → skipped & reported.
- **Unknown leave types**: skipped & reported (safer than auto-creating).
- **Balance impact**: leave balances will NOT be auto-updated (historical import only). I'll note this clearly in the UI so the user can manually adjust balances if needed.
- **Reason**: empty (not in file).
- **Reviewed by / reviewed at**: set `reviewed_by = current user`, `reviewed_at = Received On` (or now if missing).

# Plan: Import Leave History from Excel

## New feature
Add a "Import Leave History" action on the **Time Management → Leaves → Leave Requests** tab (visible to HR/Admin only), opening a dialog modeled after `EmployeeImportDialog`.

## Files to create
| File | Purpose |
|------|---------|
| `src/utils/leaveHistoryImport.ts` | Parse XLSX (using `xlsx` lib), map rows → `ParsedLeaveRow`, validate against employees + leave types, build DB insert records |
| `src/hooks/useBulkCreateLeaveRequests.ts` | Bulk insert `leave_requests` rows with status `approved`, plus optional `leave_imports` audit record |
| `src/components/timemanagement/LeaveHistoryImportDialog.tsx` | Drag/drop XLSX upload, preview table with valid/invalid badges, pagination, import button |

## Files to modify
| File | Change |
|------|--------|
| `src/components/timemanagement/LeavesTab.tsx` | Add "Import Leave History" button next to "Add Leave Request" (HR/Admin only); wire to new dialog |
| `package.json` | Add `xlsx` dependency for parsing .xlsx |

## Import logic
1. Parse all rows from sheet 1.
2. **Filter**: keep only rows where `Status` is `"Added by HR"` or `"Approved"` (case-insensitive, trimmed). All others silently dropped from preview with a counter ("X rows ignored due to status").
3. For each kept row, validate:
   - `Emp. No.` exists in `employees.employee_code` → else error "Unknown employee code"
   - `Transaction Type` matches active `leave_types.name` (case-insensitive) → else error "Unknown leave type"
   - `From Date` & `To Date` parse as valid dates and start ≤ end → else error
   - `No. of Days` is a positive number → else compute from date diff as fallback
4. Build `leave_requests` insert payload:
   - `status: 'approved'`
   - `reviewed_by: current user id`
   - `reviewed_at: parsed Received On || now`
   - `created_at: parsed Received On || now`
   - `is_half_day: false`
   - `reason: null`
5. Bulk insert in chunks of 100.

## Preview UI
- Summary badges: `N valid`, `N errors`, `N ignored (status filter)`
- Table columns: Status icon · Emp. No. · Leave Type · From · To · Days · Issues
- Pagination (20/page) like `EmployeeImportDialog`
- Import button disabled until at least 1 valid row

## Notes shown to user in dialog
- "Imported leaves are marked **Approved** and do **not** automatically update employee leave balances. Adjust balances manually via Employee Balances if needed."

