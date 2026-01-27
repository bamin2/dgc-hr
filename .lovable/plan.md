
# Global Desktop Layout Grid System Implementation

## Overview
This plan implements a standardized 8-column desktop grid system across the application while preserving existing page layouts and the LiquidGlass V2 aesthetic. The system enforces consistent sizing for header (80px) and sidebar (240px), with a centered 1152px content grid that uses 130px columns and 16px gutters.

## Grid Specification (Reference: 1440px viewport)

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Header (80px height)                                                              │
├───────────┬──────────────────────────────────────────────────────────────────────┤
│           │  24px padding                                                         │
│  Sidebar  │  ┌────────────────────────────────────────────────────────────────┐  │
│  (240px)  │  │                   8-Column Grid (1152px max)                    │ │
│           │  │  Col: 130px × 8 = 1040px                                        │ │
│           │  │  Gap: 16px × 7 = 112px                                          │ │
│           │  │  Total: 1152px                                                  │ │
│           │  └────────────────────────────────────────────────────────────────┘  │
│           │  24px padding                                                         │
└───────────┴──────────────────────────────────────────────────────────────────────┘
```

## Column Span Mapping

| Layout Type | Desktop (8-col) | Tablet (6-col) | Mobile |
|-------------|-----------------|----------------|--------|
| Full width | col-span-8 | col-span-6 | col-span-1 |
| Half | col-span-4 | col-span-3 | col-span-1 |
| Third | col-span-3 (rounded) | col-span-2 | col-span-1 |
| Two-thirds | col-span-5 | col-span-4 | col-span-1 |
| Quarter | col-span-2 | col-span-2 | col-span-1 |

## Implementation Steps

### Step 1: Create Grid Layout Components

**New File: `src/components/ui/grid-layout.tsx`**

Create reusable grid components:

```tsx
// PageContainer - Outer wrapper with app padding
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;  // For pages like org-chart that need full width
}

export function PageContainer({ children, className, fullWidth }: PageContainerProps) {
  return (
    <div className={cn(
      "w-full",
      // App outer padding: 24px (px-6)
      "px-4 sm:px-6",
      // Vertical padding
      "py-4 sm:py-6",
      className
    )}>
      {fullWidth ? children : (
        <div className="w-full max-w-[1152px] mx-auto">
          {children}
        </div>
      )}
    </div>
  );
}

// Grid - 8-column centered grid container
interface GridProps {
  children: React.ReactNode;
  className?: string;
}

export function Grid({ children, className }: GridProps) {
  return (
    <div className={cn(
      "w-full",
      // Desktop: 8 columns, Tablet: 6 columns, Mobile: 1 column
      "grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-8",
      // Consistent 16px gap
      "gap-4",
      className
    )}>
      {children}
    </div>
  );
}

// GridItem - Individual grid cell with span control
interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  // Desktop column span (8-col grid)
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  // Tablet column span (6-col grid) - defaults to auto
  tabletSpan?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function GridItem({ 
  children, 
  className,
  span = 8,
  tabletSpan,
}: GridItemProps) {
  // Map spans to Tailwind classes
  const desktopSpanClasses = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
  };
  
  const tabletSpanClasses = {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
    5: "sm:col-span-5",
    6: "sm:col-span-6",
  };
  
  // Calculate tablet span if not provided
  const effectiveTabletSpan = tabletSpan ?? Math.min(6, Math.round(span * 0.75)) as 1|2|3|4|5|6;
  
  return (
    <div className={cn(
      "col-span-1",  // Mobile: always full width
      tabletSpanClasses[effectiveTabletSpan],
      desktopSpanClasses[span],
      className
    )}>
      {children}
    </div>
  );
}
```

### Step 2: Update DashboardLayout Component

**File: `src/components/dashboard/DashboardLayout.tsx`**

Enforce exact sizing for header (80px) and sidebar (240px):

```tsx
export function DashboardLayout({ 
  children, 
  fullWidth = false,
  noPadding = false 
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ImpersonationBanner />
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div 
            className={cn(
              "w-full min-h-full",
              // Use 24px padding (px-6) consistently on desktop
              !noPadding && "px-4 sm:px-6 py-4 sm:py-6",
              // Max-width uses the grid max (1152px) + padding allowance
              !fullWidth && "max-w-[1200px] lg:max-w-none",
              // Add bottom padding on mobile for the navigation bar
              isMobile && "pb-24"
            )}
          >
            {/* Inner container for grid centering */}
            <div className={cn(
              "w-full mx-auto",
              !fullWidth && "max-w-[1152px]"
            )}>
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <MobileActionBar />
    </div>
  );
}
```

### Step 3: Update Sidebar Component

**File: `src/components/dashboard/Sidebar.tsx`**

Enforce exact 240px width (currently using w-64 = 256px when expanded):

```tsx
// Change line 97-99 from:
className={cn(
  "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-full shrink-0",
  collapsed ? "w-20" : "w-64"
)}

// To:
className={cn(
  "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-full shrink-0",
  collapsed ? "w-20" : "w-60"  // w-60 = 240px
)}
```

### Step 4: Update Header Component

**File: `src/components/dashboard/Header.tsx`**

Enforce 80px height on desktop:

```tsx
// Change line 58-59 from:
<header className="sticky top-0 z-40 bg-background border-b border-border">
  <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">

// To:
<header className="sticky top-0 z-40 bg-background border-b border-border">
  <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 px-4 sm:px-6">
```

### Step 5: Update design-tokens.ts

**File: `src/lib/design-tokens.ts`**

Add new grid tokens:

```ts
// ============================================
// LAYOUT GRID - 8-Column Desktop System
// ============================================
export const layoutGrid = {
  /** Header height */
  headerHeight: {
    mobile: 'h-14',       // 56px
    tablet: 'h-16',       // 64px
    desktop: 'h-20',      // 80px
  },
  /** Sidebar width */
  sidebarWidth: {
    collapsed: 'w-20',    // 80px
    expanded: 'w-60',     // 240px
  },
  /** App outer padding */
  appPadding: 'px-4 sm:px-6',  // 16px mobile, 24px desktop
  /** Grid container max width */
  gridMaxWidth: 'max-w-[1152px]',
  /** Column specifications */
  columns: {
    count: 8,
    width: '130px',
    gap: '16px',          // gap-4
  },
} as const;

// ============================================
// GRID COLUMN SPANS
// ============================================
export const gridSpans = {
  /** Full width: 8 columns */
  full: 'col-span-1 sm:col-span-6 lg:col-span-8',
  /** Half: 4 columns */
  half: 'col-span-1 sm:col-span-3 lg:col-span-4',
  /** Third: ~3 columns (rounded) */
  third: 'col-span-1 sm:col-span-2 lg:col-span-3',
  /** Two-thirds: 5 columns */
  twoThirds: 'col-span-1 sm:col-span-4 lg:col-span-5',
  /** Quarter: 2 columns */
  quarter: 'col-span-1 sm:col-span-2 lg:col-span-2',
} as const;
```

### Step 6: Update BentoGrid Component

**File: `src/components/dashboard/bento/BentoGrid.tsx`**

Align BentoGrid to the new 8-column system:

```tsx
export function BentoGrid({ children, className, noPadding = false }: BentoGridProps) {
  return (
    <div
      className={cn(
        // Grid layout - aligned to 8-column system
        "grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-8 gap-4",
        // Container constraints (only when not nested)
        !noPadding && "max-w-[1152px] mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Step 7: Update BentoCard Component

**File: `src/components/dashboard/bento/BentoCard.tsx`**

Adjust column spans to 8-column grid:

```tsx
interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 2 | 3 | 4 | 5 | 6 | 8;  // Updated for 8-col grid
  onClick?: () => void;
  noPadding?: boolean;
}

export function BentoCard({
  children,
  className,
  colSpan = 8,
  onClick,
  noPadding = false,
}: BentoCardProps) {
  // Map 8-col desktop spans to 6-col tablet spans
  const colSpanClasses = {
    2: "col-span-1 sm:col-span-2 lg:col-span-2",   // Quarter
    3: "col-span-1 sm:col-span-3 lg:col-span-3",   // Third (rounded)
    4: "col-span-1 sm:col-span-3 lg:col-span-4",   // Half
    5: "col-span-1 sm:col-span-4 lg:col-span-5",   // ~Two-thirds
    6: "col-span-1 sm:col-span-4 lg:col-span-6",   // Three-quarters
    8: "col-span-1 sm:col-span-6 lg:col-span-8",   // Full
  };

  return (
    <div
      className={cn(
        // Base Liquid Glass styling (existing)
        "rounded-2xl border border-white/40 dark:border-white/15",
        "bg-white/80 dark:bg-white/10",
        "backdrop-blur-sm sm:backdrop-blur-md",
        "shadow-[0_3px_8px_rgba(0,0,0,0.03)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
        "hover:bg-white/90 dark:hover:bg-white/15 hover:border-white/50 dark:hover:border-white/20",
        "hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] sm:hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
        "transition-all duration-200",
        // Grid span - updated to 8-col system
        colSpanClasses[colSpan],
        !noPadding && "p-4 sm:p-5",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
```

### Step 8: Update DashboardRenderer

**File: `src/components/dashboard/DashboardRenderer.tsx`**

Update card spans to match 8-column grid (currently uses 12-col):

```tsx
// Update WelcomeCard + NotificationsCard row
// Current: 7 + 5 = 12 columns
// New: 5 + 3 = 8 columns (or adjust as needed)
<WelcomeCard />        {/* Update to colSpan={5} */}
<NotificationsCard />  {/* Update to colSpan={3} */}

// Update other rows to sum to 8
<ApprovalsSummaryCard />  {/* colSpan={3} */}
<TimeOffSnapshotCard />   {/* colSpan={3} */}
<BusinessTripsCard />     {/* colSpan={2} */}

<ScheduleCard />          {/* colSpan={5} */}
<MyTeamCard />            {/* colSpan={3} */}
```

### Step 9: Add CSS Grid Variables

**File: `src/index.css`**

Add CSS custom properties for grid consistency:

```css
@layer base {
  :root {
    /* Layout Grid System */
    --grid-columns: 8;
    --grid-column-width: 130px;
    --grid-gap: 16px;
    --grid-max-width: 1152px;
    --sidebar-width: 240px;
    --sidebar-collapsed: 80px;
    --header-height: 80px;
    --app-padding: 24px;
  }
}

@layer utilities {
  /* Grid container utility */
  .grid-layout {
    @apply grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-8 gap-4;
    max-width: var(--grid-max-width);
    margin-left: auto;
    margin-right: auto;
  }
  
  /* Prevent horizontal overflow */
  .no-h-scroll {
    overflow-x: hidden;
    max-width: 100vw;
  }
}
```

## Files to Modify

| File | Changes |
|------|---------|
| **New:** `src/components/ui/grid-layout.tsx` | Create `PageContainer`, `Grid`, `GridItem` components |
| `src/components/dashboard/DashboardLayout.tsx` | Update inner container to center content at 1152px max |
| `src/components/dashboard/Sidebar.tsx` | Change expanded width from w-64 (256px) to w-60 (240px) |
| `src/components/dashboard/Header.tsx` | Add lg:h-20 (80px) for desktop header height |
| `src/lib/design-tokens.ts` | Add `layoutGrid` and `gridSpans` tokens |
| `src/components/dashboard/bento/BentoGrid.tsx` | Update to 8-column grid with sm:6-col tablet |
| `src/components/dashboard/bento/BentoCard.tsx` | Update colSpan interface and classes for 8-col system |
| `src/components/dashboard/DashboardRenderer.tsx` | Update card colSpan values to sum to 8 |
| `src/index.css` | Add CSS custom properties and grid utilities |

## Responsive Behavior Summary

| Breakpoint | Grid Columns | Gap | Container Behavior |
|------------|--------------|-----|-------------------|
| Mobile (< 640px) | 1 column | 16px | Full width, px-4 padding |
| Tablet (640-1024px) | 6 columns | 16px | Full width, px-6 padding |
| Desktop (> 1024px) | 8 columns | 16px | Centered, max-w-[1152px] |

## What Stays the Same

- All existing page layouts and component designs
- LiquidGlass V2 styling on all cards
- Page-specific content arrangements
- Mobile bottom navigation
- Sidebar collapse behavior (just width adjusted)
- All component logic and functionality

## Visual Representation

```text
Mobile (< 640px):
┌─────────────────────┐
│     Header (56px)   │
├─────────────────────┤
│                     │
│   [  Full Width  ]  │  ← Single column
│                     │
│   [  Full Width  ]  │
│                     │
├─────────────────────┤
│  Mobile Nav (72px)  │
└─────────────────────┘

Tablet (640-1024px):
┌─────────────────────────────┐
│        Header (64px)        │
├─────────────────────────────┤
│                             │
│  [ Col 1-3 ] [ Col 4-6 ]    │  ← 6-column grid
│                             │
│  [   Full Width (1-6)    ]  │
│                             │
└─────────────────────────────┘

Desktop (> 1024px):
┌────────────────────────────────────────────────────────┐
│                    Header (80px)                        │
├─────────┬──────────────────────────────────────────────┤
│         │                                              │
│ Sidebar │  ┌────────────────────────────────────────┐  │
│ (240px) │  │   8-Column Grid (1152px centered)      │  │
│         │  │  [1-4][5-8]  [1-3][4-6][7-8]  etc.     │  │
│         │  └────────────────────────────────────────┘  │
│         │                                              │
└─────────┴──────────────────────────────────────────────┘
```

## Technical Notes

### Grid Math
- 8 columns × 130px = 1040px (column content)
- 7 gutters × 16px = 112px (spacing)
- Total: 1152px max content width

### Tailwind Breakpoints Used
- `sm:` → 640px (tablet starts)
- `lg:` → 1024px (desktop 8-col grid)

### No Horizontal Scroll Guarantee
- All containers use `max-width: 100vw` or proper overflow handling
- Grid columns use fractional units that scale down gracefully
- Padding remains consistent at all breakpoints
