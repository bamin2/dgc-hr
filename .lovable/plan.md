
# Responsive Quality Pass - Tablet and Mobile Views

## Overview
This plan performs a targeted responsive quality pass to ensure the existing UI feels balanced, premium, and consistent on tablet and mobile views. The desktop layout will remain exactly as-is. No new components will be introduced - only normalization of existing patterns.

## Current State Analysis

### What's Already Working Well
- **Mobile Navigation**: `MobileActionBar` already has proper 72px height, 56px touch targets, and even spacing
- **Card System**: Base `Card` component already has responsive padding (`p-5 sm:p-6`) with Liquid Glass styling
- **BentoCard**: Already handles mobile stacking (`col-span-12 lg:col-span-*`)
- **Page Shell**: Has responsive padding (`px-4 sm:px-6 lg:px-8`)
- **Dialog System**: Properly handles mobile with `max-h-[90vh]` and responsive padding

### Issues to Address

#### 1. Layout & Flow Issues
| Component | Issue | Fix |
|-----------|-------|-----|
| `TimeOffCalendarTab` | Uses `flex gap-6` causing side-by-side on tablet | Stack on mobile/tablet |
| `PayrollMetrics` | Uses `gap-5` which feels dense on mobile | Reduce to `gap-4` on mobile |
| Various grids | Use `md:grid-cols-2` which activates too early on small tablets | Some should use `sm:` breakpoint more carefully |

#### 2. Spacing Issues
| Component | Issue | Fix |
|-----------|-------|-----|
| `BentoCard` | Uses fixed `p-5` on all breakpoints | Already correct via Card base |
| `MobileGreetingCard` | Uses `p-4 pb-3` - could be slightly more spacious | Maintain current - fits design |
| `MobileStatusCards` | Uses `gap-3` - appropriate for mobile | Keep current |
| Various section headers | Using `space-y-4` consistently | Already correct |

#### 3. Typography Issues
| Component | Issue | Fix |
|-----------|-------|-----|
| `WelcomeCard` | Uses fixed `text-2xl` heading | Add responsive: `text-xl sm:text-2xl` |
| `TimeOffSnapshotCard` | Uses `text-2xl` for numbers | Add responsive sizing |
| Various `text-xl` headings | Not scaling down on mobile | Limit to `text-lg` on mobile |
| `ApprovalsSummaryCard` | Uses `text-2xl` for count | Add responsive sizing |

#### 4. Glass & Visual Effects Issues
| Component | Issue | Fix |
|-----------|-------|-----|
| `Card` | Uses `backdrop-blur-md` on all screens | Add mobile variant with reduced blur |
| `BentoCard` | Same glass effects on all breakpoints | Add responsive shadow/blur reduction |
| Elevated surfaces | Shadow `0_4px_12px` consistent | Reduce on mobile by ~30% |

#### 5. Button & Touch Target Issues
| Component | Issue | Fix |
|-----------|-------|-----|
| `TimeOffMonthCalendar` toolbar | Multiple buttons in row on mobile | Stack or simplify on mobile |
| `Dialog/Sheet footers` | Side-by-side buttons on mobile | Already handled with `flex-col-reverse sm:flex-row` |
| Filter pills in `MobileRequestsHub` | Already at `min-h-[44px]` | Keep current |

#### 6. Consistency Issues
| Component | Issue | Fix |
|-----------|-------|-----|
| Metric card typography | Inconsistent sizing across pages | Standardize responsive pattern |
| Card shadows | Mix of custom shadows and defaults | Normalize shadow intensity |

## Implementation Plan

### Step 1: Add Responsive CSS Utilities
**File:** `src/index.css`

Add tablet/mobile-specific glass effect modifiers:
- Create `.surface-glass-mobile` with reduced blur (`backdrop-blur-sm`) and shadow (~30% reduced)
- Add responsive typography helpers for metric values

```css
/* Mobile-optimized glass surface */
@media (max-width: 768px) {
  .surface-glass-responsive {
    backdrop-filter: blur(8px); /* Reduced from blur-md (12px) */
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03); /* ~30% reduced */
  }
  
  .surface-glass-elevated-responsive {
    backdrop-filter: blur(12px); /* Reduced from blur-lg (16px) */
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05); /* ~30% reduced */
  }
}
```

### Step 2: Fix TimeOffCalendarTab Layout
**File:** `src/components/timeoff/TimeOffCalendarTab.tsx`

Change from side-by-side to stacked on mobile/tablet:
```tsx
// FROM:
<div className="flex gap-6">

// TO:
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
```

### Step 3: Fix TimeOffMonthCalendar Toolbar
**File:** `src/components/timeoff/TimeOffMonthCalendar.tsx`

Make toolbar responsive:
- Stack controls on mobile
- Reduce button/toggle sizes
- Hide "Day" view option on mobile (too cramped)

```tsx
// Toolbar container
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 mb-4">
  
  {/* Today button - smaller on mobile */}
  <Button variant="outline" size="sm" className="h-9" onClick={goToToday}>Today</Button>
  
  {/* View toggle - hide Day on mobile, full on tablet+ */}
  <ToggleGroup className="border rounded-lg order-3 sm:order-2">
    <ToggleGroupItem value="day" className="px-3 hidden sm:inline-flex">Day</ToggleGroupItem>
    <ToggleGroupItem value="week" className="px-3">Week</ToggleGroupItem>
    <ToggleGroupItem value="month" className="px-3">Month</ToggleGroupItem>
  </ToggleGroup>
  
  {/* Navigation - simplified text on mobile */}
  <div className="flex items-center gap-1 sm:gap-2 order-2 sm:order-3">
    ...
    <span className="text-xs sm:text-sm font-medium min-w-[140px] sm:min-w-[220px] text-center">
      {viewMode === "month" 
        ? format(currentDate, "MMM yyyy") // Shorter on mobile
        : dateRangeDisplay}
    </span>
    ...
  </div>
</div>
```

### Step 4: Fix Typography Scaling
**File:** `src/components/dashboard/bento/WelcomeCard.tsx`

```tsx
// FROM:
<h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">

// TO:
<h1 className="text-lg sm:text-2xl font-semibold text-foreground flex items-center gap-2">
```

**File:** `src/components/dashboard/bento/TimeOffSnapshotCard.tsx`

```tsx
// Desktop variant - FROM:
<p className="text-2xl font-bold text-foreground">

// TO:
<p className="text-xl sm:text-2xl font-bold text-foreground">
```

**File:** `src/components/dashboard/bento/ApprovalsSummaryCard.tsx`

```tsx
// FROM:
<span className="text-2xl font-bold text-foreground">{totalPending}</span>

// TO:
<span className="text-xl sm:text-2xl font-bold text-foreground">{totalPending}</span>
```

**File:** `src/components/dashboard/admin/LoanExposureCard.tsx`

```tsx
// FROM:
<p className="text-2xl font-semibold">

// TO:
<p className="text-lg sm:text-2xl font-semibold">
```

**File:** `src/components/dashboard/personal/MyRequestsCard.tsx`

```tsx
// FROM:
<p className="text-xl font-bold">{item.count}</p>

// TO:
<p className="text-lg sm:text-xl font-bold">{item.count}</p>
```

**File:** `src/components/dashboard/admin/OrgOverviewCard.tsx`

```tsx
// FROM:
<p className="text-xl font-bold">{item.value}</p>

// TO:
<p className="text-lg sm:text-xl font-bold">{item.value}</p>
```

### Step 5: Update Card Component with Responsive Glass Effects
**File:** `src/components/ui/card.tsx`

Add responsive shadow and blur reduction for mobile:
```tsx
// Update Card className
className={cn(
  "rounded-xl border border-white/40 dark:border-white/15",
  "bg-white/80 dark:bg-white/10",
  "backdrop-blur-sm sm:backdrop-blur-md", // Reduced blur on mobile
  "text-card-foreground",
  "shadow-[0_3px_8px_rgba(0,0,0,0.03)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.04)]", // ~30% reduced on mobile
  "hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] sm:hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
  "hover:border-white/50 dark:hover:border-white/20 transition-all duration-200",
  className
)}
```

### Step 6: Update BentoCard with Responsive Glass Effects
**File:** `src/components/dashboard/bento/BentoCard.tsx`

```tsx
className={cn(
  // Base Liquid Glass styling - responsive blur/shadow
  "rounded-2xl border border-white/40 dark:border-white/15",
  "bg-white/80 dark:bg-white/10",
  "backdrop-blur-sm sm:backdrop-blur-md", // Reduced on mobile
  "shadow-[0_3px_8px_rgba(0,0,0,0.03)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.04)]", // ~30% reduced on mobile
  // Hover effects - also scaled
  "hover:bg-white/90 dark:hover:bg-white/15 hover:border-white/50 dark:hover:border-white/20",
  "hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] sm:hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
  // Transitions
  "transition-all duration-200",
  // Grid span
  colSpanClasses[colSpan],
  // Padding - use p-4 on mobile, p-5 on tablet+
  !noPadding && "p-4 sm:p-5",
  // Interactive styling
  onClick && "cursor-pointer",
  className
)}
```

### Step 7: Update Dialog/Drawer for Reduced Glass on Mobile
**File:** `src/components/ui/dialog.tsx`

```tsx
// Update dialogContentVariants base string
"fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 sm:gap-5 border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-md sm:backdrop-blur-lg p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.06)] sm:shadow-[0_8px_30px_rgba(0,0,0,0.08)] duration-200 ..."
```

**File:** `src/components/ui/drawer.tsx`

```tsx
// Update DrawerContent
"fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[1.25rem] border border-white/40 dark:border-white/15 bg-white/95 dark:bg-[hsl(168_35%_10%)]/95 backdrop-blur-md shadow-[0_-6px_20px_rgba(0,0,0,0.05)]"
```

### Step 8: Update PayrollMetrics Grid Spacing
**File:** `src/components/payroll/PayrollMetrics.tsx`

```tsx
// FROM:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

// TO:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
```

### Step 9: Update Elevated Surfaces (Popover, Dropdown, Select)
**File:** `src/components/ui/popover.tsx`

```tsx
// Update PopoverContent
"z-50 w-72 rounded-lg border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-md sm:backdrop-blur-lg p-4 text-popover-foreground shadow-[0_6px_20px_rgba(0,0,0,0.06)] sm:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ..."
```

**File:** `src/components/ui/dropdown-menu.tsx`

```tsx
// Update DropdownMenuContent
"z-50 min-w-[8rem] overflow-hidden rounded-lg border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-md sm:backdrop-blur-lg p-1 text-popover-foreground shadow-[0_6px_20px_rgba(0,0,0,0.06)] sm:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ..."
```

**File:** `src/components/ui/select.tsx`

Apply same pattern to SelectContent.

### Step 10: Update index.css with Responsive Typography Helpers
**File:** `src/index.css`

```css
/* Add responsive metric text utility */
@layer utilities {
  .text-metric {
    @apply text-lg sm:text-xl font-bold;
  }
  
  .text-metric-lg {
    @apply text-xl sm:text-2xl font-bold;
  }
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add responsive typography utilities |
| `src/components/ui/card.tsx` | Responsive blur and shadow |
| `src/components/ui/dialog.tsx` | Responsive gap, padding, blur, shadow |
| `src/components/ui/drawer.tsx` | Reduced blur and shadow |
| `src/components/ui/popover.tsx` | Responsive blur and shadow |
| `src/components/ui/dropdown-menu.tsx` | Responsive blur and shadow |
| `src/components/ui/select.tsx` | Responsive blur and shadow |
| `src/components/dashboard/bento/BentoCard.tsx` | Responsive padding, blur, shadow |
| `src/components/dashboard/bento/WelcomeCard.tsx` | Responsive heading size |
| `src/components/dashboard/bento/TimeOffSnapshotCard.tsx` | Responsive number size |
| `src/components/dashboard/bento/ApprovalsSummaryCard.tsx` | Responsive number size |
| `src/components/dashboard/admin/LoanExposureCard.tsx` | Responsive number size |
| `src/components/dashboard/admin/OrgOverviewCard.tsx` | Responsive number size |
| `src/components/dashboard/personal/MyRequestsCard.tsx` | Responsive number size |
| `src/components/timeoff/TimeOffCalendarTab.tsx` | Stack layout on mobile/tablet |
| `src/components/timeoff/TimeOffMonthCalendar.tsx` | Responsive toolbar |
| `src/components/payroll/PayrollMetrics.tsx` | Responsive grid gap |

## Visual Summary

```text
┌─────────────────────────────────────────────────────────────────┐
│                    BEFORE (Issues)                              │
├─────────────────────────────────────────────────────────────────┤
│ Mobile:                                                         │
│ - backdrop-blur-md (heavy on GPU)                              │
│ - shadow-[0_4px_12px...] (too strong)                          │
│ - text-2xl headings (too large)                                │
│ - Side-by-side layouts that don't stack                        │
│                                                                 │
│ Tablet:                                                         │
│ - Same glass effects as desktop (too heavy)                    │
│ - Some grids activate 2-col too early                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AFTER (Normalized)                           │
├─────────────────────────────────────────────────────────────────┤
│ Mobile (< 640px):                                               │
│ - backdrop-blur-sm (lighter, performant)                       │
│ - shadow-[0_3px_8px...] (~30% reduced)                         │
│ - text-lg headings (properly scaled)                           │
│ - Single column stacking                                        │
│ - p-4 card padding                                              │
│                                                                 │
│ Tablet (640px - 1024px):                                        │
│ - backdrop-blur-md (medium)                                     │
│ - shadow-[0_4px_12px...] (standard)                            │
│ - text-xl headings (balanced)                                   │
│ - 2-column where appropriate                                    │
│ - p-5 card padding                                              │
│                                                                 │
│ Desktop (> 1024px):                                             │
│ - Unchanged - full glass effects                                │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Notes

### Breakpoint Strategy
- **Mobile**: `< 640px` (default styles, no prefix)
- **Tablet**: `640px - 1023px` (`sm:` prefix)
- **Desktop**: `≥ 1024px` (`lg:` prefix)

### Glass Effect Scaling
| Breakpoint | Blur | Shadow Opacity |
|------------|------|----------------|
| Mobile | `backdrop-blur-sm` (4px) | ~30% reduced |
| Tablet | `backdrop-blur-md` (12px) | Standard |
| Desktop | `backdrop-blur-md/lg` (12-16px) | Standard |

### Typography Scaling
| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Page titles | `text-lg` | `text-xl` | `text-2xl` |
| Card titles | `text-base` | `text-lg` | `text-lg` |
| Metric numbers | `text-lg` | `text-xl` | `text-2xl` |
| Body text | `text-sm/base` | `text-base` | `text-base` |

### Unchanged Elements
- All form field logic and validation
- Button functionality and variants
- Mobile bottom navigation structure
- Touch target minimums (44px)
- Dialog scrolling behavior
- Card hover states (just reduced intensity)
