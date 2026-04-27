# Fix: Duplicate leave history entries

## What I found

I queried `leave_requests` and confirmed your suspicion:

- **400 approved leave rows** total, of which **199 are exact duplicate pairs** and only 2 are singletons.
- Every duplicate group has exactly 2 rows. The two rows are byte-for-byte identical: same `employee_id`, `leave_type_id`, `start_date`, `end_date`, `days_count`, `created_at`, `reviewed_at`, `reviewed_by` — everything matches.
- This pattern (everything duplicated exactly twice, nothing triplicated) means the import file was processed twice. Most likely the Import dialog's "Confirm Import" was clicked twice, or the dialog was reopened and the same file imported again before the first batch finished.
- The current importer has no duplicate guard — `useBulkCreateLeaveRequests` just calls `.insert(...)`, so re-running the same file always doubles every row.

## Plan

### 1. Clean up the existing duplicates (one-time SQL)

Delete one row from each duplicate pair, keeping the row with the smaller `id`. Targets only exact duplicates of `(employee_id, leave_type_id, start_date, end_date, days_count, status)` so nothing legitimate gets touched.

```sql
DELETE FROM leave_requests
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY employee_id, leave_type_id, start_date, end_date, days_count, status
        ORDER BY id
      ) AS rn
    FROM leave_requests
  ) t
  WHERE rn > 1
);
```

Expected: 199 rows deleted, 201 remaining. I'll verify the count before and after.

### 2. Prevent it from happening again — guard in the importer

Two layers of protection in `src/components/timemanagement/LeaveHistoryImportDialog.tsx` and `src/hooks/useBulkCreateLeaveRequests.ts`:

- **Pre-insert check**: Before inserting, query existing `leave_requests` for the same `employee_id` + `start_date` + `end_date` + `leave_type_id` set, and skip any record that already exists. Show a summary in the success toast: "X imported, Y skipped as duplicates."
- **Disable the Confirm button** while the mutation is in flight (it's currently re-clickable) and reset it after success — this stops the double-click case at the UI layer.

No DB schema changes (no unique index added) so legitimate edge cases like one employee taking the same leave type on the same day across years remain possible — the duplicate detection is scoped to exact `(employee, type, start, end)` matches which already shouldn't happen twice.

## Files to modify

- `src/components/timemanagement/LeaveHistoryImportDialog.tsx` — disable button while importing, show skipped count in toast.
- `src/hooks/useBulkCreateLeaveRequests.ts` — pre-fetch existing requests for the affected employees and filter out matching records before insert; return `{ inserted, skipped }`.

## What to expect after

- Employee profiles will show each leave once (~199 fewer rows).
- Re-running the same import file will report "0 imported, N skipped as duplicates" instead of doubling everything.
