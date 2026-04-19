

The import dialog uses `useLeaveTypes()` which filters `is_active=true AND visible_to_employees=true`. For an admin import flow, it should see ALL active leave types regardless of visibility. `useAllLeaveTypes()` (returns everything including inactive) and `useActiveLeaveTypes()` (active only, no visibility filter) already exist — the second is what we want.

## Change

**`src/components/timemanagement/LeaveHistoryImportDialog.tsx`**
- Replace `useLeaveTypes()` with `useActiveLeaveTypes()` so the importer matches against every active leave type, including those hidden from employees.

That's it — the matching logic in `leaveHistoryImport.ts` (case-insensitive name match + manual mapping for unknown ones) is unchanged. Hidden-from-employees types will now auto-match instead of falling into the "unknown" bucket.

