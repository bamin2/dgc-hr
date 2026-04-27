# Sync 2026 "Days Taken" from imported leave history

## What I found

- Employee profile → Time Off tab reads "Days Taken" from `leave_balances.used_days` for the current year (2026).
- The leave history import inserts approved rows into `leave_requests` but **does not touch `leave_balances`** (the import dialog even says "do not automatically update employee leave balances").
- For 2026 there are approved leaves totaling many days per employee (e.g., 18 Annual Leave days, 7 Sick Leave days), but `leave_balances.used_days` for year=2026 is still 0 for most of them.
- 52 balance rows already exist for 2026 across 27 employees; some (employee, leave_type) combinations from the imports have no 2026 balance row at all.

## Goal

Reflect imported 2026 leaves in "Days Taken" without changing the displayed "Remaining". Since `remaining = total_days − used_days − pending_days`, the only way to keep remaining unchanged while bumping `used_days` is to bump `total_days` by the same amount. That preserves the allowance the user already sees on screen.

## One-time SQL migration

For every (employee, leave_type) with approved leaves in 2026:

1. Compute `taken_2026 = SUM(days_count)` from `leave_requests` where `status='approved'` and `start_date BETWEEN '2026-01-01' AND '2026-12-31'`.
2. Compute `delta = taken_2026 − current used_days` for that (employee, leave_type, year=2026) row (or `taken_2026` if no row exists).
3. **Upsert** the `leave_balances` row for `year=2026`:
   - If row exists: `used_days := used_days + delta`, `total_days := total_days + delta`. Result: remaining unchanged, taken now matches reality.
   - If row missing: insert `used_days = taken_2026`, `total_days = taken_2026`, `pending_days = 0`. Remaining = 0 (no allowance was ever set; this is correct — we're just recording history).

Public Holiday entries are excluded so company holidays don't inflate personal balances.

## Files

- One database migration. No code changes — the UI already displays whatever is in `leave_balances`.

## What changes for the user

- "Days Taken (this year)" on each employee's Time Off tab will now include the imported 2026 leaves.
- "Annual Leave Remaining" stays the same number it shows today.
- Underlying `leave_requests` records are not modified.
