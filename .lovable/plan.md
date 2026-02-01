
# Add "Today Snapshot" Strip to WelcomeCard

## Overview
Add a compact horizontal strip between the header and quick action tiles showing 3 mini-stats: Next Leave, Pending Requests, and Approvals Waiting (manager only).

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Good morning, Bader! ✨         Today                  │
│  Here's what's happening today   Sat, Feb 1            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  ← NEW: Snapshot Strip
│  │ 📅 Feb 15   │  │ ⏳ 2        │  │ ✓ 5         │     │
│  │ Next Leave  │  │ Pending     │  │ To Approve  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │  ← Action Tiles
│  │ 📅   │  │ ✈️   │  │ 📄   │  │ ✓    │               │
│  └──────┘  └──────┘  └──────┘  └──────┘               │
└─────────────────────────────────────────────────────────┘
```

## Technical Implementation

### File: `src/components/dashboard/bento/WelcomeCard.tsx`

### 1. Add New Imports
```tsx
import { CalendarCheck, Clock, CheckCircle } from "lucide-react";
import { usePersonalDashboard } from "@/hooks/usePersonalDashboard";
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";
import { Skeleton } from "@/components/ui/skeleton";
```

### 2. Add Data Hooks
```tsx
const { data: dashboardData, isLoading: dashboardLoading } = usePersonalDashboard();
const { data: approvalsCount, isLoading: approvalsLoading } = usePendingApprovalsCount();
```

### 3. Compute Stats
```tsx
// Next leave date (first upcoming time off)
const nextLeave = dashboardData?.upcomingTimeOff[0];
const nextLeaveDisplay = nextLeave 
  ? format(new Date(nextLeave.startDate), "MMM d") 
  : "None";

// Pending requests count
const pendingRequests = dashboardData?.requestsSummary.pending ?? 0;

// Approvals waiting (only for managers)
const showApprovals = isManager || canEditEmployees;
const approvalsWaiting = approvalsCount ?? 0;
```

### 4. Add Snapshot Strip Component (between header and action grid)
```tsx
{/* Today Snapshot Strip */}
<div className={cn(
  "grid gap-2",
  showApprovals ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
)}>
  {/* Next Leave */}
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
    <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">Next Leave</p>
      <p className="text-sm font-medium truncate">{nextLeaveDisplay}</p>
    </div>
  </div>

  {/* Pending Requests */}
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">Pending</p>
      <p className="text-sm font-medium">{pendingRequests}</p>
    </div>
  </div>

  {/* Approvals Waiting (manager only) */}
  {showApprovals && (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">To Approve</p>
        <p className="text-sm font-medium">{approvalsWaiting}</p>
      </div>
    </div>
  )}
</div>
```

### 5. Loading State
Add skeleton placeholders when data is loading:
```tsx
{dashboardLoading ? (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-12 rounded-lg" />
    ))}
  </div>
) : (
  // Snapshot strip content
)}
```

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< sm) | Stacked (1 column) |
| Tablet (sm) | 2 columns + 1 wrap OR 3 columns |
| Desktop (md+) | 3 columns in one row |

## Styling Details

- **Background**: `bg-secondary/30` - subtle, non-intrusive
- **Corners**: `rounded-lg` - consistent with card system
- **Padding**: `px-3 py-2` - compact but touchable
- **Icons**: 4x4 size, color-coded by type
- **Text**: xs label, sm value - visually quiet hierarchy
- **No heavy borders**: relies on background contrast only

## Data Sources

| Stat | Source | Loading State |
|------|--------|---------------|
| Next Leave | `usePersonalDashboard().upcomingTimeOff[0]` | Skeleton |
| Pending Requests | `usePersonalDashboard().requestsSummary.pending` | Skeleton |
| Approvals Waiting | `usePendingApprovalsCount()` | Skeleton |

## Conditional Logic

- **Approvals stat**: Only shown if `isManager || canEditEmployees` is true
- **Grid columns**: Adjusts from 2 to 3 based on whether approvals is shown
- **Empty states**: Shows "None" for no upcoming leave, "0" for counts
