## Problem

Three dead navigation targets exist:

1. **`PendingApprovalsCard`** (team manager dashboard) navigates to `/leave?status=pending` — no `/leave` route is registered in `AnimatedRoutes`. Button does nothing useful.
2. **`pages/Attendance.tsx`** — exists in the codebase but is not wired into `AnimatedRoutes`. Its "Request Leave" button navigates to `/attendance/leave/request`, which also does not exist. Page is effectively dead code.
3. **`components/timemanagement/AttendanceTab.tsx`** — rendered inside `/time-management`, has a "Request Leave" button that navigates to the same nonexistent `/attendance/leave/request` route.

Project convention (memory): leave creation must use a modal dialog (`RequestTimeOffDialog`), not a `/new` route. Approvals live at `/approvals` (the admin `AllPendingApprovalsCard` already uses the correct query string).

## Changes

### 1. `src/components/dashboard/team/PendingApprovalsCard.tsx`
Replace `navigate('/leave?status=pending')` with the same target the admin card uses:
`navigate('/approvals?tab=all-requests&type=time_off')`

This matches `AllPendingApprovalsCard` and points to the actually-registered `/approvals` route.

### 2. `src/components/timemanagement/AttendanceTab.tsx`
Remove the broken `navigate('/attendance/leave/request')` call. Wire the "Request Leave" button to open the existing `RequestTimeOffDialog` modal:
- Add local `isRequestLeaveOpen` state.
- Button `onClick` sets it to `true`.
- Render `<RequestTimeOffDialog open={isRequestLeaveOpen} onOpenChange={setIsRequestLeaveOpen} />` at the bottom of the component (alongside existing dialogs).

### 3. `src/pages/Attendance.tsx` (dead page)
This page is not referenced anywhere except itself and is not in the router. Two options:

**Recommended:** Delete `src/pages/Attendance.tsx`. Its functionality is fully duplicated by `components/timemanagement/AttendanceTab.tsx` (used inside `/time-management`). Keeping it around invites future drift.

If preferred to keep it, apply the same `RequestTimeOffDialog` fix as in step 2, but it would still be unreachable.

## Verification

After changes:
- `rg "navigate\(['\"]/(leave|attendance)" src/` should return no results other than the legitimate `/time-management/leave/:id` detail link in `LeaveRequestsTable.tsx`.
- Team manager dashboard "Review Requests" button lands on `/approvals` filtered to time off.
- "Request Leave" button inside `/time-management` Attendance tab opens the personal leave request modal.

## Technical notes

- `RequestTimeOffDialog` is already exported from `src/components/timeoff/`. It uses `useCreateLeaveRequest` and follows the existing modal pattern.
- No router changes required; we are removing dead targets, not adding new routes.
- No new routes are added because `/attendance` is intentionally consolidated under `/time-management` per the time-management restructure memory.
