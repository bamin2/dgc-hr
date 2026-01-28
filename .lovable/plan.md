
# Make All TabsList Components Scrollable

## Problem
In Employee Management → Employee profile and other pages throughout the app, the tabs are not scrollable on smaller screens. When there are many tabs (like Overview, Employment, Documents, Loans, Benefits, Time Off, Activity, Roles), they overflow but cannot be scrolled horizontally.

## Root Cause
The `TabsList` component in `src/components/ui/tabs.tsx` already has `overflow-x-auto scrollbar-none` which should enable horizontal scrolling. However, the tabs still don't scroll because:

1. The `inline-flex` container needs `max-w-full` to respect the parent's width constraints
2. The tabs need to actually overflow - currently they might be shrinking to fit

## Solution
Update the base `TabsList` component to ensure horizontal scrolling works everywhere by adding `max-w-full` and ensuring the flex container allows content to overflow.

## Implementation

### File to Modify

**`src/components/ui/tabs.tsx`**

Update the `TabsList` default className to include scrollability fixes:

```tsx
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // LiquidGlass V2 pill track
      "inline-flex h-auto items-center gap-1 p-1",
      "bg-white/15 border border-white/20 backdrop-blur-md rounded-full",
      // Mobile scroll support - UPDATED
      "max-w-full overflow-x-auto scrollbar-none",
      className
    )}
    {...props}
  />
));
```

The key change is adding `max-w-full` which constrains the container to the parent's width, forcing the content to overflow and trigger the horizontal scroll.

## Pages That Will Benefit

This single change will fix scrolling for all tab components across the app:

| Page | Tabs Count |
|------|-----------|
| Employee Profile | 8 tabs (Overview, Employment, Documents, Loans, Benefits, Time Off, Activity, Roles) |
| My Profile | 7 tabs (Overview, Personal, Compensation, Documents, Time Off, Loans, Benefits) |
| Benefits | 4 tabs |
| Business Trips | 4 tabs |
| Hiring | 3 tabs |
| Reports | 5 tabs |
| Documents | 3 tabs |
| Time Management | 3 tabs |
| Loans | 4 tabs |
| Notifications | 3 tabs |
| Attendance | 5 tabs |
| And many more... |

## Technical Notes

1. **Single fix for all tabs**: By fixing the base component, every page using `TabsList` automatically gets scrollable tabs
2. **No breaking changes**: The `max-w-full` constraint is additive and won't break existing layouts
3. **Mobile-first**: This primarily benefits mobile users but also helps desktop users on narrow viewports
4. **Touch-friendly**: The `scrollbar-none` class already hides the scrollbar for a cleaner mobile experience while maintaining scroll functionality via touch
