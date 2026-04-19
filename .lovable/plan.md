

User wants column mapping UI instead of auto-detection by header names. Currently `parseLeaveHistoryXLSX` uses a hardcoded `HEADER_MAP` and silently filters by Status. The "218 ignored" is the status filter — but the root cause is likely that the Status column isn't being detected (so every row's status reads as empty → all ignored), OR the values differ from "Added by HR"/"Approved".

Let me check the dialog to confirm current flow, then plan a mapping step.

# Plan: Add column mapping step to Leave History Import

## Problem
The current importer auto-maps Excel headers via a fixed dictionary. If the user's file has slightly different headers (e.g. "Status " with trailing space, or different casing/punctuation we didn't anticipate, or a localized header), the field isn't detected — and every row gets filtered out as "ignored" because Status reads as empty. The user wants explicit control.

## Solution: Two-step dialog (Upload → Map → Preview → Import)

### New mapping step
After the file is parsed, show a mapping screen where the user picks which Excel column corresponds to each required/optional field.

**Required mappings:**
- Employee Code (Emp. No.)
- Transaction Type (Leave Type)
- From Date
- To Date
- Status

**Optional mappings:**
- No. of Days (auto-computed from dates if not mapped)
- Received On (defaults to now if not mapped)

**Status value mapping:** After Status column is selected, show the unique values found in that column with checkboxes so the user explicitly picks which statuses to import (defaults: "Added by HR" and "Approved" pre-checked if found). This eliminates the silent ignore.

### Smart defaults
On entering the mapping step, pre-select dropdowns using the existing `HEADER_MAP` heuristic so users with standard files just click "Next".

### Files to modify
| File | Change |
|------|--------|
| `src/utils/leaveHistoryImport.ts` | Split parsing into two phases: (1) `readSheetRaw(buffer)` → `{ headers: string[], rows: Record<string, any>[] }`, (2) `parseRowsWithMapping(rows, mapping, allowedStatuses)` → `ParsedLeaveRow[]`. Export `suggestMapping(headers)` that returns auto-detected mapping using existing `HEADER_MAP`. |
| `src/components/timemanagement/LeaveHistoryImportDialog.tsx` | Add `step` state: `'upload' \| 'map' \| 'preview'`. Insert mapping UI between upload and preview using `Select` per field + checkbox list for status values. Show counts: total rows, rows after status filter, valid, errors. |

### Mapping UI sketch
```text
Map your columns
─────────────────────────────────────
Employee Code *      [ Emp. No.        ▼ ]
Transaction Type *   [ Transaction Type ▼ ]
From Date *          [ From Date       ▼ ]
To Date *            [ To Date         ▼ ]
Status *             [ Status          ▼ ]
No. of Days          [ No. of Days     ▼ ]
Received On          [ Received On     ▼ ]

Statuses to import (found in column "Status"):
  [x] Added by HR        (143 rows)
  [x] Approved           (62 rows)
  [ ] Pending            (180 rows)
  [ ] Rejected           (38 rows)

[ Back ]                            [ Preview → ]
```

### Behavior changes
- "X rows ignored due to status" becomes accurate — driven by the user's explicit status selection.
- If a required mapping is missing, "Preview" button is disabled.
- All existing validation (unknown employee, unknown leave type, etc.) runs unchanged after mapping.

No DB schema or hook changes needed.

