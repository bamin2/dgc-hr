

# Remove Total Allowance Card

## Overview
Remove the "Total Allowance" card (days per year) from the TimeOffSummaryCard component and ensure uniform spacing for the remaining 4 cards.

## Current State

The component currently displays 5 SummaryItem cards:
1. **Available to book** (bg-primary/90) - Keep
2. **Pending approval** (bg-teal-500/85) - Keep
3. **Days booked** (bg-amber-500/85) - Keep
4. **Total allowance** (bg-teal-500/85) - **Remove**
5. **Public Holidays** (bg-rose-400/85) - Keep

## Changes Required

### Step 1: Remove Total Allowance SummaryItem

**File:** `src/components/timeoff/TimeOffSummaryCard.tsx`

Remove lines 110-116 (the Total Allowance SummaryItem):
```tsx
<SummaryItem
  icon={<Briefcase className="w-4 h-4" />}
  bgColor="bg-teal-500/85"
  days={totalDays}
  label="days per year"
  sublabel="Total allowance"
/>
```

### Step 2: Clean Up Unused Code

Remove the unused `Briefcase` import (line 1) and the unused `totalDays` variable (lines 54-55):
```tsx
// Remove from imports
import { Check, Clock, Calendar, Flag } from "lucide-react";

// Remove this variable (no longer needed)
// const totalDays = annualLeaveBalance?.total_days || 0;
```

### Step 3: Update Loading Skeleton Count

Update the loading skeleton to show 4 items instead of 5 (line 74):
```tsx
{[1, 2, 3, 4].map((i) => (
  <Skeleton key={i} className="h-16 w-full rounded-xl" />
))}
```

### Spacing Analysis

The current spacing uses `space-y-3` (12px gap) on the CardContent container. This already provides uniform spacing between all cards. After removing the Total Allowance card, the 4 remaining cards will maintain this consistent 12px gap automatically - no spacing adjustments needed.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/timeoff/TimeOffSummaryCard.tsx` | Remove Total Allowance card, unused import, unused variable, update skeleton count |

## Visual Result

```text
Before (5 cards):                    After (4 cards):
┌─────────────────────┐              ┌─────────────────────┐
│ ✓ Available to book │              │ ✓ Available to book │
├─────────────────────┤              ├─────────────────────┤
│ ⏱ Pending approval  │              │ ⏱ Pending approval  │
├─────────────────────┤              ├─────────────────────┤
│ 📅 Days booked      │              │ 📅 Days booked      │
├─────────────────────┤              ├─────────────────────┤
│ 💼 Total allowance  │  ← REMOVE    │ 🚩 Public Holidays  │
├─────────────────────┤              └─────────────────────┘
│ 🚩 Public Holidays  │
└─────────────────────┘
```

## Technical Notes

- **Uniform spacing**: The `space-y-3` class already ensures equal 12px gaps between all cards
- **No layout changes**: Grid/flex structure remains unchanged
- **Code cleanup**: Removing unused import and variable keeps code clean

