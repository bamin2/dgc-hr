

User wants two improvements to the leave history importer:
1. For unknown `transactionType` values, let user pick which existing leave type to map them to (instead of marking row as error)
2. Show employee name in the preview step

Let me check the current preview UI quickly.
<lov-tool-use id="toolu_vrtx_01Mt7T5fQeTZUc7UnrvTnW1Y" name="code--search_files" integration-id="code" data="{\"query\": \"empName|Employee\", \"include_patterns\": \"src/components/timemanagement/LeaveHistoryImportDialog.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01LWUiDyv4gyYSvPyQJ6xW2o" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/timemanagement/LeaveHistoryImportDialog.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01U55SEUoCMPu2WQqYHEzxTD" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/timemanagement/LeaveHistoryImportDialog.tsx\", \"lines\": \"430-495\"}">
</lov-tool-use>
<lov-plan>

# Plan: Resolve unknown leave types + show employee names in preview

## 1. Leave-type resolution step (between Map and Preview)

After preview is generated, collect every unique `transactionType` value that doesn't match any existing `leave_types.name` (case-insensitive). If any unknowns exist, insert a new sub-step **"Resolve leave types"** before showing the preview table.

UI:
```
The following leave types from your file don't exist in the system.
Pick what to assign each one (or skip to ignore those rows).

  "EL"            → [ Annual Leave           ▼ ]   (143 rows)
  "Casual"        → [ Select leave type...   ▼ ]   (62 rows)
  "Maternity-EX"  → [ — Skip these rows —    ▼ ]   (5 rows)

[ Back ]                              [ Continue → ]
```

- Known types are auto-matched and not shown.
- Each unknown value gets a `Select` of all active leave types + a "— Skip —" option.
- "Continue" button is enabled when every unknown is either mapped or explicitly skipped.

## 2. Apply resolutions when validating

Pass a `Map<rawValue, leaveTypeId | 'skip'>` into validation. In `validateLeaveRow`:
- If `transactionType` matches a known type → use it (current behavior).
- Else if resolution map has `leaveTypeId` → use that ID, mark row valid.
- Else if resolution = `'skip'` → mark row as ignored (count under a new "skipped (unknown type)" badge, not as an error).
- Else (no resolution) → current "Unknown leave type" error.

## 3. Show employee name in preview table

Add an **Employee** column between "Emp. No." and "Leave Type":
- If `empName` was mapped from the file → display that value.
- Else, look up the matched employee by `employee_code` and display `first_name last_name`.
- Falls back to "—" if unknown.

This requires fetching `first_name, last_name` in `useEmployeesForImport` (currently only fetches `id, employee_code`).

## Files to modify

| File | Change |
|---|---|
| `src/components/timemanagement/LeaveHistoryImportDialog.tsx` | Add `'resolve'` step between `'map'` and `'preview'`. New state `unknownTypes` + `typeResolutions`. Compute unknowns after mapping, branch to resolve step if any. Pass resolutions into validation. Add Employee column to preview table. Add "skipped (unknown type)" badge. |
| `src/utils/leaveHistoryImport.ts` | Extend `validateLeaveRow` to accept an optional `typeResolutions: Map<string, string \| 'skip'>` and apply the lookup. Add `getUnknownLeaveTypes(rows, leaveTypes)` helper that returns unique unmatched type strings with row counts. |
| `src/components/timemanagement/LeaveHistoryImportDialog.tsx` (employee fetch) | Update `useEmployeesForImport` query to also select `first_name, last_name`. |

No DB or hook changes required.

