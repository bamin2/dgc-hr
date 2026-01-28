
# Fix: Leave Request Detail Page Missing (404 Error)

## Problem Summary
When clicking the "View" button (eye icon) on a leave request in Time Management → Leave Requests, the app navigates to `/attendance/leave/:id` which returns a 404 error because this route doesn't exist in the application's router configuration.

## Root Cause
The `LeaveRequestsTable.tsx` component (line 117) navigates to `/attendance/leave/${request.id}`, but:
1. **No route is defined** for `/attendance/leave/:id` in `App.tsx`
2. **No detail page exists** for viewing individual leave requests

## Solution Overview
Create a new `LeaveRequestDetail` page that displays:
- Employee information (name, avatar, department)
- Leave type and duration
- Request submission date
- Reason for leave
- Current status with visual indicator
- Approval workflow progress (showing each step, who approved/rejected, when)
- Rejection reason (if applicable)
- Action buttons for HR/Admin to approve or reject pending requests

## Implementation Details

### Step 1: Create the Leave Request Detail Page

**New File: `src/pages/LeaveRequestDetail.tsx`**

This page will follow the same pattern as `BusinessTripDetail.tsx`:
- Use `useParams` to get the leave request ID from the URL
- Use `useLeaveRequest(id)` hook (already exists) to fetch the request data
- Use `useRequestApprovalSteps(id, 'time_off')` to fetch approval workflow
- Display loading state while fetching
- Show error state if request not found
- Render the detail view with all relevant information

Key sections to display:
1. **Back navigation** - Return to leave requests list
2. **Header** - Employee info + request status badge
3. **Leave Details Card** - Type, dates, duration, half-day indicator
4. **Reason Card** - Why the employee requested leave
5. **Approval Progress** - Visual timeline of approval steps using existing `ApprovalProgressSteps` component
6. **Action Bar** (for HR/Admin) - Approve/Reject buttons if request is pending

### Step 2: Add the Route to App.tsx

**File: `src/App.tsx`**

Add a new lazy-loaded import and route:

```tsx
// Add to lazy imports section
const LeaveRequestDetail = lazy(() => import("./pages/LeaveRequestDetail"));

// Add route (in the HR/Admin protected routes section, near line 106)
<Route 
  path="/attendance/leave/:id" 
  element={
    <ProtectedRoute requiredRoles={['hr', 'admin']}>
      <DashboardLazyPage><LeaveRequestDetail /></DashboardLazyPage>
    </ProtectedRoute>
  } 
/>
```

### Step 3: Create Leave Request Detail View Component

**New File: `src/components/attendance/LeaveRequestDetailView.tsx`**

A reusable component (similar to `TripDetailView.tsx`) that renders:

```tsx
interface LeaveRequestDetailViewProps {
  request: LeaveRequest;
}
```

Layout structure:
```text
┌─────────────────────────────────────────────────────────────────┐
│  Status & Actions Bar                                           │
│  [Status Badge: Pending/Approved/Rejected]    [Approve] [Reject]│
│  ⚠️ Negative balance warning (if applicable)                    │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐  ┌────────────────────────────────┐
│  Leave Details             │  │  Request Information           │
│                            │  │                                │
│  📅 Leave Type             │  │  👤 Submitted By               │
│     Annual Leave           │  │     [Avatar] Employee Name     │
│                            │  │     Department                 │
│  📆 Dates                  │  │                                │
│     Mar 25 - Mar 26, 2026  │  │  🕐 Submitted On               │
│                            │  │     Jan 15, 2026 at 10:30 AM   │
│  ⏱️ Duration               │  │                                │
│     2 days                 │  │  👁️ Reviewed By (if approved)  │
│                            │  │     HR Manager Name            │
│  📝 Half Day               │  │     Jan 16, 2026               │
│     No                     │  │                                │
└────────────────────────────┘  └────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Reason                                                         │
│  "Personal appointment with family members visiting from abroad"│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Approval Progress                                              │
│  ○──────○──────●                                               │
│  HR    HR     ✓                                                 │
│  Done  Pending                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Rejection Reason (if rejected)                                 │
│  "Insufficient leave balance remaining for this period"         │
└─────────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/LeaveRequestDetail.tsx` | **Create** | New page component for leave request details |
| `src/components/attendance/LeaveRequestDetailView.tsx` | **Create** | Reusable detail view component |
| `src/App.tsx` | **Modify** | Add route for `/attendance/leave/:id` |
| `src/components/attendance/index.ts` | **Modify** | Export new component |

## Existing Components/Hooks to Reuse

- `useLeaveRequest(id)` - Already exists in `useLeaveRequests.ts` (line 110-148)
- `useRequestApprovalSteps(requestId, 'time_off')` - Already exists in `useApprovalSteps.ts`
- `LeaveStatusBadge` - Already exists for status display
- `ApprovalProgressSteps` - Already exists for approval workflow visualization
- `useApproveLeaveRequest()` / `useRejectLeaveRequest()` - Already exist for actions
- `useRole()` / `useAuth()` - For permission checks

## Access Control
- Route protected for HR and Admin roles only
- Regular employees cannot view other employees' leave request details through this route
- Employees can view their own requests through the Time Off page

## Technical Notes

### Hook Usage Example
```tsx
// In LeaveRequestDetail.tsx
const { id } = useParams<{ id: string }>();
const { data: request, isLoading, error } = useLeaveRequest(id || '');
const { data: approvalSteps } = useRequestApprovalSteps(id || '', 'time_off');
```

### Permission Checks
```tsx
const { currentUser } = useRole();
const { profile } = useAuth();
const isHROrAdmin = currentUser.role === 'hr' || currentUser.role === 'admin';
const isPending = request.status === 'pending';
const canApprove = isHROrAdmin && isPending;
```
