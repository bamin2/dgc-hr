

# Fix WelcomeCard Whitespace and Tile Styling

## Root Cause

The WelcomeCard (`colSpan={5}`) shares Row 1 with NotificationsCard (`colSpan={3}`). CSS Grid stretches all cards in a row to match the tallest card's height. When NotificationsCard is taller (due to 3 notification items), the WelcomeCard stretches but its content doesn't fill the extra space, creating empty whitespace.

## Solution

Prevent the WelcomeCard from stretching to match sibling height by using CSS `align-self: start`. This makes the card only as tall as its content while keeping it at the top of the row.

## Technical Changes

### File: `src/components/dashboard/bento/WelcomeCard.tsx`

**Line 110 - Update BentoCard className:**
```tsx
// Before
<BentoCard colSpan={5} className="flex flex-col gap-2 pb-3">

// After  
<BentoCard colSpan={5} className="flex flex-col gap-2 pb-3 self-start">
```

Adding `self-start` (Tailwind for `align-self: start`) tells the grid to not stretch this card vertically. The card will:
- Only be as tall as its content
- Align to the top of the grid row
- No longer show empty whitespace

## Visual Result

**Before (both cards stretch to same height):**
```text
┌─────────────────────────┐  ┌─────────────────┐
│ Good morning, Bader!    │  │ Notifications   │
│ ┌───┐ ┌───┐ ┌───┐       │  │ • Item 1        │
│ │   │ │   │ │   │       │  │ • Item 2        │
│ └───┘ └───┘ └───┘       │  │ • Item 3        │
│ [TimeOff] [Trip] [...]  │  │ View all →      │
│                         │  └─────────────────┘
│    ← Empty whitespace   │
│                         │
└─────────────────────────┘
```

**After (WelcomeCard is content-height only):**
```text
┌─────────────────────────┐  ┌─────────────────┐
│ Good morning, Bader!    │  │ Notifications   │
│ ┌───┐ ┌───┐ ┌───┐       │  │ • Item 1        │
│ │   │ │   │ │   │       │  │ • Item 2        │
│ └───┘ └───┘ └───┘       │  │ • Item 3        │
│ [TimeOff] [Trip] [...]  │  │ View all →      │
└─────────────────────────┘  └─────────────────┘
```

## Summary

| Change | Location | Details |
|--------|----------|---------|
| Add `self-start` | Line 110, BentoCard className | Prevents vertical stretch from grid |

This is a single-line change that solves the whitespace issue without modifying layout, spacing, or the existing tile styling (which already looks correct with `bg-secondary/20`, `rounded-xl`, hover states, etc.).
