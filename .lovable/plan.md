

# Reorganize Time Management: Move Leave Content and Hide Attendance

## Overview

This plan reorganizes the Time Management page to focus solely on leave tracking by:
1. Moving the "Overview" and "Leave Requests" tabs from Attendance to Leaves
2. Hiding all attendance-related features until they're implemented
3. Updating routes and navigation to remove attendance terminology

## Current vs New Structure

**Current Time Management Page:**
```text
Time Management
├── Attendance (main tab) ← REMOVE THIS TAB
│   ├── Overview           ← MOVE TO LEAVES
│   ├── Attendance         ← HIDE
│   ├── Leave Requests     ← MOVE TO LEAVES
│   ├── Corrections        ← HIDE
│   └── Calendar           ← HIDE
├── Leaves (main tab)
│   ├── Leave Policies
│   ├── Employee Balances
│   ├── Public Holidays
│   └── Adjustment History
└── Email Templates (main tab)
```

**New Time Management Page:**
```text
Time Management
├── Leaves (main tab - NOW DEFAULT)
│   ├── Overview           ← MOVED HERE (renamed: Leave Overview)
│   ├── Leave Requests     ← MOVED HERE
│   ├── Leave Policies
│   ├── Employee Balances
│   ├── Public Holidays
│   └── Adjustment History
└── Email Templates (main tab)
```

## Implementation Steps

### Step 1: Update LeavesTab Component

**File**: `src/components/timemanagement/LeavesTab.tsx`

Merge the Overview and Leave Requests functionality from AttendanceTab into LeavesTab:

- Add new sub-tabs: "Overview" and "Leave Requests" 
- Import the required components: LeaveMetrics (new), LeaveBalanceCard, LeaveRequestsTable
- Set "overview" as the default tab value
- Add the "Request Leave" button at the top
- Include leave balance summary and pending requests in Overview
- Create a filtered Leave Requests view with status filter

The tab order will be:
1. Overview (default)
2. Leave Requests
3. Leave Policies
4. Employee Balances
5. Public Holidays
6. Adjustment History

### Step 2: Create LeaveMetrics Component

**File**: `src/components/attendance/LeaveMetrics.tsx` (new)

Create a simplified metrics component focused only on leave data:
- Employees on Leave Today
- Pending Leave Requests
- Upcoming Leaves (next 7 days)
- Available Leave Balance (average across employees)

This replaces AttendanceMetrics and removes attendance-specific metrics like "Present Today" and "Late Arrivals".

### Step 3: Update TimeManagement Page

**File**: `src/pages/TimeManagement.tsx`

Changes:
- Remove the Attendance tab entirely
- Set "leaves" as the default tab value
- Update page subtitle to: "Manage leave policies, employee time off, and public holidays."
- Remove AttendanceTab import

### Step 4: Update Routes

**File**: `src/App.tsx`

Changes:
- Change `/attendance` route to `/time-management` (or remove duplicate since `/time-management` exists)
- Change `/attendance/leave/:id` to `/time-management/leave/:id`
- Remove `/attendance/leave/request` navigation references

### Step 5: Update Leave Request Navigation

**Files to update**:
- `src/components/attendance/LeaveRequestsTable.tsx` - Change navigation from `/attendance/leave/:id` to `/time-management/leave/:id`
- `src/pages/LeaveRequestDetail.tsx` - Update back button and breadcrumb links from `/attendance` to `/time-management`
- `src/components/timemanagement/AttendanceTab.tsx` - Remove the "Request Leave" navigation (will be handled in LeavesTab)

### Step 6: Clean Up Attendance References

**Files to review and update**:
1. `src/components/attendance/AttendanceMetrics.tsx` - Keep but won't be used
2. `src/components/attendance/AttendanceTable.tsx` - Keep but won't be used
3. `src/components/attendance/AttendanceFilters.tsx` - Keep but won't be used
4. `src/components/attendance/AttendanceCalendar.tsx` - Keep but won't be used
5. `src/components/attendance/CorrectionsTab.tsx` - Keep but won't be used
6. `src/data/attendance.ts` - Keep LeaveRequest/LeaveBalance types, comment out attendance records

The attendance components are kept for future use but will not be rendered.

### Step 7: Update Page Subtitle

**File**: `src/pages/TimeManagement.tsx`

Change subtitle from:
> "Manage attendance tracking, leave policies, and employee time off."

To:
> "Manage leave policies, employee time off, and public holidays."

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/timemanagement/LeavesTab.tsx` | **Major Update** | Add Overview and Leave Requests tabs, import leave components |
| `src/components/attendance/LeaveMetrics.tsx` | **Create** | New leave-focused metrics component |
| `src/pages/TimeManagement.tsx` | **Update** | Remove Attendance tab, update subtitle |
| `src/App.tsx` | **Update** | Change routes from `/attendance/*` to `/time-management/*` |
| `src/components/attendance/LeaveRequestsTable.tsx` | **Update** | Change navigation path |
| `src/pages/LeaveRequestDetail.tsx` | **Update** | Update back button and breadcrumb |
| `src/components/attendance/index.ts` | **Update** | Export LeaveMetrics |

## Technical Details

### New LeaveMetrics Component Structure

```tsx
export function LeaveMetrics() {
  const { data: pendingRequests } = usePendingLeaveRequests();
  const { data: leaveBalances } = useLeaveBalanceSummary(undefined);
  
  const metrics = [
    {
      title: 'On Leave Today',
      value: /* count from approved leaves where today is within date range */,
      icon: Calendar,
    },
    {
      title: 'Pending Requests',
      value: pendingRequests?.length || 0,
      icon: Users,
    },
    {
      title: 'Upcoming Leaves',
      value: /* count leaves starting in next 7 days */,
      icon: CalendarDays,
    },
    {
      title: 'Avg Balance',
      value: /* average remaining leave balance */,
      icon: TrendingUp,
    },
  ];
  // ... render cards
}
```

### Updated LeavesTab Structure

```tsx
export function LeavesTab() {
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  
  // Fetch leave data
  const { data: allLeaveRequests } = useLeaveRequests();
  const { data: pendingRequests } = usePendingLeaveRequests();
  const { data: leaveBalances } = useLeaveBalanceSummary(undefined);
  
  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={() => navigate('/time-management/leave/request')}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="policies">Leave Policies</TabsTrigger>
          <TabsTrigger value="balances">Employee Balances</TabsTrigger>
          <TabsTrigger value="holidays">Public Holidays</TabsTrigger>
          <TabsTrigger value="history">Adjustment History</TabsTrigger>
        </TabsList>
        
        {/* Tab contents... */}
      </Tabs>
    </>
  );
}
```

## What Gets Hidden (Not Deleted)

These components and files are kept for future attendance implementation:
- `AttendanceTab.tsx` - Will not be rendered
- `AttendanceMetrics.tsx` - Will not be rendered
- `AttendanceTable.tsx` - Will not be rendered
- `AttendanceFilters.tsx` - Will not be rendered
- `AttendanceCalendar.tsx` - Will not be rendered
- `CorrectionsTab.tsx` - Will not be rendered
- All attendance hooks in `useAttendanceRecords.ts` and `useAttendanceCorrections.ts`

## Route Changes Summary

| Old Route | New Route |
|-----------|-----------|
| `/attendance` | `/time-management` (keep existing) |
| `/attendance/leave/:id` | `/time-management/leave/:id` |
| `/attendance/leave/request` | `/time-management/leave/request` |

