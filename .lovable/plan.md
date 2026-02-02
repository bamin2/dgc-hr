

# Transform "My Team" Card to "Who's Off" Card

## Overview
Refocus the card from general team information to specifically showing upcoming team member absences. The card will display the next 3-4 employees who will be on leave with their leave dates.

## Changes Summary

| Current | New |
|---------|-----|
| Title: "My Team" | Title: "Who's Off" |
| Users icon | CalendarOff or UserMinus icon |
| Shows team member count badge | Remove or show "X upcoming" count |
| "Upcoming Time Off" sub-header | Remove (redundant with new title) |
| Shows 2 employees | Shows 3-4 employees |
| "Open Directory" button | "View Calendar" or similar button |

## Visual Comparison

**Before:**
```
┌─────────────────────────────────────┐
│ 👥 My Team                 3 members│
│                                     │
│ UPCOMING TIME OFF                   │
│ ┌─────────────────────────────────┐ │
│ │ AB  Alice Brown                 │ │
│ │     📅 Feb 15 - Feb 18          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ JD  John Doe                    │ │
│ │     📅 Feb 20 - Feb 22          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ Open Directory → ]                │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│ 📅 Who's Off               3 upcoming│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ AB  Alice Brown     Feb 15 - 18 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ JD  John Doe        Feb 20 - 22 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ SM  Sarah Miller    Feb 25 - 28 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ View Calendar → ]                 │
└─────────────────────────────────────┘
```

## Technical Changes

### File: `src/components/dashboard/bento/MyTeamCard.tsx`

**1. Update imports (line 2)**
- Replace `Users` icon with `CalendarOff` or `UserMinus` for the "off" concept

**2. Header section (lines 37-45)**
- Change title from "My Team" to "Who's Off"
- Update icon to match new concept
- Change badge from team count to upcoming absences count

**3. Remove sub-header (lines 48-51)**
- Remove the "Upcoming Time Off" label since it's now redundant with the card title

**4. Increase displayed items (line 59)**
- Change `.slice(0, 2)` to `.slice(0, 4)` to show 3-4 employees

**5. Update empty state message (line 55)**
- Change from "No one is out soon" to something like "No upcoming time off"

**6. Update CTA button (lines 94-101)**
- Change label from "Open Directory" to "View Calendar"
- Navigate to `/time-off` or `/time-management` instead of `/employees`

**7. Skeleton loading state (lines 23-26)**
- Add additional skeleton rows to match the new 3-4 item display

## Summary

| Change | Location | Details |
|--------|----------|---------|
| Title & icon | Header | "My Team" → "Who's Off", new icon |
| Badge | Header | Team count → upcoming count |
| Sub-header | Content | Remove redundant label |
| List items | Content | 2 → 4 employees |
| Empty state | Content | Updated message |
| CTA button | Footer | "Open Directory" → "View Calendar" |
| Skeletons | Loading | Add 2 more rows |

