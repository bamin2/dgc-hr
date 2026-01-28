
# Fix Public Holidays Count and Year Synchronization in Time Off Calendar

## Problems Identified

### Problem 1: Mismatched Numbers
The summary shows "13 Public Holidays" with sublabel "14 total in 2026":
- **13** = remaining holidays (where `observed_date >= today`)
- **14** = total holidays in the year

This is confusing because the main number and sublabel don't match.

### Problem 2: Year Doesn't Update When Navigating
When navigating to January 2027, the "About your time off" card still shows 2026 data because:
- `TimeOffSummaryCard` uses `new Date().getFullYear()` (always current year)
- `TimeOffMonthCalendar` manages its own date state internally
- No state is shared between these components

## Solution

### Approach: Lift State to Parent Component
Share the selected year between both components via props, so when the calendar navigates to a different year, the summary card updates accordingly.

### Visual Diagram
```text
Before:
┌─────────────────────────────────────────────────────────────┐
│  TimeOffCalendarTab                                         │
│  ┌───────────────────┐   ┌────────────────────────────────┐ │
│  │ TimeOffSummaryCard│   │ TimeOffMonthCalendar           │ │
│  │ year = 2026       │   │ currentDate = state (can be    │ │
│  │ (hardcoded)       │   │ navigated to any month/year)   │ │
│  └───────────────────┘   └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

After:
┌─────────────────────────────────────────────────────────────┐
│  TimeOffCalendarTab                                         │
│  [selectedYear] ← state managed here                        │
│  ┌───────────────────┐   ┌────────────────────────────────┐ │
│  │ TimeOffSummaryCard│   │ TimeOffMonthCalendar           │ │
│  │ year = prop ─────────→│ onYearChange callback          │ │
│  └───────────────────┘   └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Update TimeOffCalendarTab (Parent)

Add state to track the currently viewed year:

```tsx
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
```

Pass props to both child components.

### Step 2: Update TimeOffMonthCalendar

Add callback prop to notify parent when year changes:

```tsx
interface TimeOffMonthCalendarProps {
  onYearChange?: (year: number) => void;
}
```

Call `onYearChange` whenever the user navigates to a different year.

### Step 3: Update TimeOffSummaryCard

Accept year as a prop instead of hardcoding:

```tsx
interface TimeOffSummaryCardProps {
  year?: number;
}
```

Use the prop for fetching holidays and displaying the summary.

### Step 4: Fix the Display Logic

Change from showing "remaining holidays" to showing "total holidays" for consistency:

**Current (confusing):**
- Main number: 13 (remaining)
- Sublabel: "14 total in 2026"

**Fixed (consistent):**
- Main number: 14 (total for the year)
- Sublabel: "X remaining in 2026"

This makes more sense because the card is about "the year" not just "remaining days".

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/timeoff/TimeOffCalendarTab.tsx` | Add `selectedYear` state, pass props to children |
| `src/components/timeoff/TimeOffSummaryCard.tsx` | Accept `year` prop, fix display logic |
| `src/components/timeoff/TimeOffMonthCalendar.tsx` | Add `onYearChange` callback prop |

## Expected Behavior After Fix

1. **January 2026**: Shows "14 Public Holidays" with "X remaining in 2026"
2. **Navigate to January 2027**: Summary updates to show 2027 data (e.g., "0 Public Holidays" with "0 remaining in 2027" if no holidays are configured for that year)
3. **Numbers always match**: The main count and sublabel reference the same dataset

## Technical Notes

- The `usePublicHolidays` hook already accepts a `year` parameter, so no changes needed there
- We detect year change in `TimeOffMonthCalendar` by comparing `currentDate.getFullYear()` with the previous value using a `useEffect`
- All other metrics in the summary card (PTO, pending, booked) remain tied to the current user's leave balances regardless of the viewed year
