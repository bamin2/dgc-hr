
# Fix: Make Leaves Subtabs Horizontally Scrollable

## Problem
The subtabs in the Leaves tab (Overview, Leave Requests, Leave Policies, Employee Balances, Public Holidays, Adjustment History) are not scrollable on smaller screens. With 6 tabs containing icons and text, they overflow the container but users cannot scroll to see all options.

## Root Cause
The `TabsList` component has `overflow-x-auto scrollbar-none` which should enable scrolling but:
1. The `rounded-full` creates a pill container that can clip overflow content
2. The `inline-flex` may prevent proper scroll behavior in some contexts
3. The hidden scrollbar (`scrollbar-none`) provides no visual affordance that scrolling is possible
4. The tab triggers may shrink instead of maintaining their minimum width

## Solution
Wrap the TabsList in a ScrollArea component with a horizontal scrollbar for better mobile experience, and ensure tab triggers don't shrink.

## Implementation

**File: `src/components/timemanagement/LeavesTab.tsx`**

1. Import ScrollArea and ScrollBar from UI components
2. Wrap the TabsList in a ScrollArea with horizontal orientation
3. Add `flex-shrink-0` to TabsTrigger elements to prevent shrinking

### Code Changes

```tsx
// Add import
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Wrap TabsList in ScrollArea
<ScrollArea className="w-full whitespace-nowrap">
  <TabsList className="w-max">
    <TabsTrigger value="overview" className="flex-shrink-0">
      <LayoutDashboard className="h-4 w-4" />
      Overview
    </TabsTrigger>
    <TabsTrigger value="requests" className="flex-shrink-0">
      <ClipboardList className="h-4 w-4" />
      Leave Requests
    </TabsTrigger>
    {/* ... other tabs with flex-shrink-0 */}
  </TabsList>
  <ScrollBar orientation="horizontal" className="h-2" />
</ScrollArea>
```

## Visual Result

**Before:**
```text
┌─────────────────────────────────────────────────────────┐
│ [Overview] [Leave Requests] [Leave Pol...] (cut off)    │
│ ← Cannot scroll to see more tabs                        │
└─────────────────────────────────────────────────────────┘
```

**After:**
```text
┌─────────────────────────────────────────────────────────┐
│ [Overview] [Leave Requests] [Leave Policies] →          │
│ ← Horizontal scroll bar visible, can drag to see more → │
└─────────────────────────────────────────────────────────┘
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/timemanagement/LeavesTab.tsx` | Wrap TabsList in ScrollArea, add flex-shrink-0 to triggers |

## Technical Notes
- The ScrollArea component uses Radix UI and provides consistent scrolling behavior across browsers
- The horizontal ScrollBar provides a visual indicator that more content is available
- `w-max` on TabsList ensures it takes the full width of its content
- `whitespace-nowrap` on ScrollArea prevents the tabs from wrapping to multiple lines
- `flex-shrink-0` on each TabsTrigger prevents tabs from compressing their content
