
# Redesign WelcomeCard as Compact Quick Actions Card

## Problem
The current WelcomeCard has empty whitespace in the center because of `flex-col gap-4` with `mt-auto` on the button row, pushing the buttons to the bottom and leaving a gap in the middle. The card also lacks a date pill and uses inline pill buttons instead of action tiles.

## Solution
Redesign the card into a tight, purposeful "Quick Actions" layout with three sections:

1. **Header row**: Greeting + subtitle on the left, "Today" date pill on the right
2. **Quick actions grid**: 2x2 grid of action tiles (4 columns on desktop)
3. **Optional footer**: Subtle "View all" link (if appropriate)

## Design Decisions

- **Remove fixed heights**: No `h-[]` or `min-h-[]` constraints - content-driven height
- **Remove `mt-auto`**: Eliminates the vertical gap pushing buttons down
- **Grid tiles**: Each tile has icon + label, subtle hover state, glassmorphism-compatible styling
- **Date pill**: Shows formatted date like "Sat, Feb 1" to fill the header right side
- **Reduce internal padding**: Use `gap-3` instead of `gap-4` for tighter spacing
- **Tile styling**: Match the premium LiquidGlass aesthetic with subtle borders and hover effects

## Layout Structure

```text
┌─────────────────────────────────────────────────────────┐
│  Good morning, Bader! ✨        │  📅 Sat, Feb 1        │
│  Here's what's happening today  │     Today             │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │  📅          │ │  ✈️          │ │  📄          │ │  ✓           │ │
│ │  Time Off    │ │  Trip        │ │  HR Letter   │ │  Approvals   │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### File: `src/components/dashboard/bento/WelcomeCard.tsx`

**Changes:**

1. **Import date-fns for formatting**:
   ```tsx
   import { format } from "date-fns";
   ```

2. **Add date helpers**:
   ```tsx
   const today = new Date();
   const formattedDate = format(today, "EEE, MMM d"); // "Sat, Feb 1"
   ```

3. **Update BentoCard container**: Remove `gap-4`, use `gap-3` for tighter spacing
   ```tsx
   <BentoCard colSpan={5} className="flex flex-col gap-3">
   ```

4. **Header row with date pill**: Add the date pill to the right
   ```tsx
   <div className="flex items-start justify-between">
     <div className="space-y-0.5">
       <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
         {getGreeting()}, {firstName}!
         <Sparkles className="h-4 w-4 text-primary" />
       </h1>
       <p className="text-sm text-muted-foreground">
         Here's what's happening today
       </p>
     </div>
     {/* Today pill */}
     <div className="flex flex-col items-end">
       <span className="text-xs font-medium text-muted-foreground">Today</span>
       <span className="text-sm font-medium text-foreground">{formattedDate}</span>
     </div>
   </div>
   ```

5. **Replace button row with action tiles grid**:
   ```tsx
   <div className="grid grid-cols-4 gap-2">
     {actions.map((action) => {
       const Icon = action.icon;
       return (
         <button
           key={action.label}
           onClick={action.onClick}
           className={cn(
             "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl",
             "bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10",
             "hover:bg-white/70 dark:hover:bg-white/10 hover:border-white/60 dark:hover:border-white/15",
             "transition-all duration-150",
             "text-foreground"
           )}
         >
           <Icon className="h-5 w-5 text-primary" />
           <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
         </button>
       );
     })}
   </div>
   ```

6. **Remove `mt-auto pt-2`** from the actions container - this was causing the whitespace

7. **Adjust actions slice**: Keep `slice(0, 4)` to ensure exactly 4 tiles fit the grid

## Visual Comparison

**Before:**
```text
┌────────────────────────────────────────┐
│  Good morning, Bader! ✨               │
│  Here's what's happening today         │
│                                        │  ← Empty whitespace
│                                        │
│  [Time Off] [Trip] [HR Letter] [...]   │  ← Small inline buttons
└────────────────────────────────────────┘
```

**After:**
```text
┌────────────────────────────────────────┐
│  Good morning, Bader! ✨    Today      │
│  Here's what's happening    Sat, Feb 1 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │  📅    │ │  ✈️    │ │  📄    │ │  ✓     │ │
│  │Time Off│ │  Trip  │ │HR Letter│ │Approvals│ │
│  └────────┘ └────────┘ └────────┘ └────────┘ │
└────────────────────────────────────────┘
```

## Summary of Changes

| Location | Change |
|----------|--------|
| Imports | Add `format` from `date-fns` |
| BentoCard className | Change `gap-4` to `gap-3` |
| Header section | Add date pill on right, reduce `space-y-1` to `space-y-0.5` |
| Title | Reduce from `text-lg sm:text-2xl` to `text-lg`, smaller sparkle icon |
| Actions container | Replace flex button row with `grid grid-cols-4 gap-2` |
| Action items | Replace `Button` components with styled tile buttons |
| Remove | `mt-auto pt-2` from actions container |
