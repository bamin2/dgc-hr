

# Remove Leave Balance Card and Extend Pending Requests to Full Width

## Summary
Remove the Leave Balance bento card from the Time Management → Leaves → Overview tab and extend the Pending Leave Requests section to occupy the full width of the tab.

## Current Layout
```text
┌─────────────────────────────────────────────────────────────┐
│  Leave Metrics (4 cards row)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌────────────────────────────────────────┐
│  Leave Balance  │  │  Pending Leave Requests                │
│  Card           │  │  (lg:col-span-2)                       │
│  (1 col)        │  │                                        │
└─────────────────┘  └────────────────────────────────────────┘
```

## New Layout
```text
┌─────────────────────────────────────────────────────────────┐
│  Leave Metrics (4 cards row)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Pending Leave Requests                                     │
│  (Full Width)                                               │
└─────────────────────────────────────────────────────────────┘
```

## Changes Required

**File: `src/components/timemanagement/LeavesTab.tsx`**

1. **Remove the grid layout wrapper** - No longer needed since there's only one card
2. **Remove LeaveBalanceCard import** - Remove from the imports since it won't be used
3. **Remove LeaveBalanceCard component** - Delete lines 77-80
4. **Remove unused hook** - Remove `useLeaveBalanceSummary` import and the `leaveBalances` + `balancesLoading` variables
5. **Make Pending Requests full width** - Remove the grid wrapper div and the `lg:col-span-2` class from the Pending Requests container

## Code Changes

### Before (lines 76-112):
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Leave Balance */}
  <div>
    <LeaveBalanceCard balances={leaveBalances} isLoading={balancesLoading} />
  </div>

  {/* Pending Leave Requests */}
  <div className="lg:col-span-2">
    <Card className="border-0 shadow-sm">
      ...
    </Card>
  </div>
</div>
```

### After:
```tsx
{/* Pending Leave Requests */}
<Card className="border-0 shadow-sm">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <CardTitle className="text-base font-semibold">
        Pending Leave Requests
      </CardTitle>
      <Button
        variant="link"
        className="text-primary p-0 h-auto"
        onClick={() => setActiveTab('requests')}
      >
        View All
      </Button>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    {pendingLoading ? (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    ) : (
      <LeaveRequestsTable requests={(pendingRequests || []).slice(0, 5)} />
    )}
  </CardContent>
</Card>
```

## Cleanup

| Item | Action |
|------|--------|
| `LeaveBalanceCard` import | Remove from imports |
| `useLeaveBalanceSummary` import | Remove from imports |
| `leaveBalances` variable | Remove declaration |
| `balancesLoading` variable | Remove declaration |
| Grid wrapper `<div className="grid...">` | Remove entirely |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/timemanagement/LeavesTab.tsx` | Remove LeaveBalanceCard, remove grid layout, make Pending Requests full width |

