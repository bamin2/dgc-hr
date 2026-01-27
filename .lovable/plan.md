

# Soften Time Off Status Cards

## Overview
Refine the colored status cards in the Time Off page to reduce visual loudness while maintaining clarity. This involves reducing color saturation, adjusting icon sizes, and ensuring consistency with the liquid glass design system.

## Current State Analysis

The `TimeOffSummaryCard` component uses `SummaryItem` components with:
- **Colors**: Vibrant Tailwind classes (`bg-primary`, `bg-teal-500`, `bg-orange-500`, `bg-rose-400`)
- **Border radius**: `rounded-xl` (12px)
- **Icon size**: `w-5 h-5` (20px)
- **Icon container**: `w-10 h-10` (40px)
- **Shadow**: None (flat colored blocks)

## Design Specifications

### Color Adjustments (10-15% less saturation)
```text
Card Type             Current Color          Softened Color
──────────────────────────────────────────────────────────────────
Available PTO         bg-primary             bg-[#1A3A38] (muted primary)
Pending Approval      bg-teal-500            bg-teal-500/85 (reduced opacity)
Days Booked           bg-orange-500          bg-orange-400/85 (softer orange)
Total Allowance       bg-teal-500            bg-teal-500/85 (reduced opacity)
Public Holidays       bg-rose-400            bg-rose-400/85 (reduced opacity)
```

### Visual Refinements
```text
Property              Current Value          Updated Value
──────────────────────────────────────────────────────────────────
Border Radius         rounded-xl             rounded-2xl (match card system)
Shadow                (none)                 shadow-sm (subtle depth)
Icon Size             w-5 h-5                w-4 h-4 (16px, less dominant)
Icon Container        w-10 h-10              w-9 h-9 (36px, proportional)
Transition            (none)                 transition-all duration-200
```

## Implementation Plan

### Step 1: Update SummaryItem Component

**File:** `src/components/timeoff/TimeOffSummaryCard.tsx`

Update the `SummaryItem` component styling:

**Current code (lines 17-31):**
```tsx
function SummaryItem({ icon, bgColor, days, label, sublabel }: SummaryItemProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${bgColor}`}>
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="flex-1 text-white">
        <p className="font-semibold">
          <span className="text-xl">{days}</span> {label}
        </p>
        <p className="text-sm opacity-80">{sublabel}</p>
      </div>
    </div>
  );
}
```

**Updated code:**
```tsx
function SummaryItem({ icon, bgColor, days, label, sublabel }: SummaryItemProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-sm transition-all duration-200 ${bgColor}`}>
      <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="flex-1 text-white">
        <p className="font-semibold">
          <span className="text-xl">{days}</span> {label}
        </p>
        <p className="text-sm opacity-80">{sublabel}</p>
      </div>
    </div>
  );
}
```

Changes:
- `rounded-xl` → `rounded-2xl` (consistent with card system)
- Added `shadow-sm` for subtle depth
- Added `transition-all duration-200` for polish
- `w-10 h-10` → `w-9 h-9` (smaller icon container)
- `bg-white/20` → `bg-white/25` (slightly more visible icon background)

### Step 2: Update Icon Sizes

**File:** `src/components/timeoff/TimeOffSummaryCard.tsx`

Reduce all icon sizes from `w-5 h-5` to `w-4 h-4`:

| Line | Current | Updated |
|------|---------|---------|
| 90 | `<Check className="w-5 h-5" />` | `<Check className="w-4 h-4" />` |
| 97 | `<Clock className="w-5 h-5" />` | `<Clock className="w-4 h-4" />` |
| 104 | `<Calendar className="w-5 h-5" />` | `<Calendar className="w-4 h-4" />` |
| 111 | `<Briefcase className="w-5 h-5" />` | `<Briefcase className="w-4 h-4" />` |
| 118 | `<Flag className="w-5 h-5" />` | `<Flag className="w-4 h-4" />` |

### Step 3: Soften Background Colors

**File:** `src/components/timeoff/TimeOffSummaryCard.tsx`

Update bgColor props to use softer, less saturated versions:

| Line | Current Color | Softened Color |
|------|---------------|----------------|
| 91 | `bg-primary` | `bg-primary/90` |
| 98 | `bg-teal-500` | `bg-teal-500/85` |
| 105 | `bg-orange-500` | `bg-amber-500/85` |
| 112 | `bg-teal-500` | `bg-teal-500/85` |
| 119 | `bg-rose-400` | `bg-rose-400/85` |

Note: Using opacity-based softening maintains color harmony while reducing visual intensity. Changed `bg-orange-500` to `bg-amber-500/85` for a warmer, softer tone.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/timeoff/TimeOffSummaryCard.tsx` | Update SummaryItem styling, icon sizes, and background colors |

## Visual Comparison

```text
Before (Status Card):
┌─────────────────────────────────────────┐
│ ┌────┐                                  │
│ │ 🔶 │  12 days paid time off           │  ← Vibrant bg-orange-500
│ └────┘  Available to book               │  ← Large 20px icon
│         rounded-xl, no shadow           │
└─────────────────────────────────────────┘

After (Status Card):
╔═════════════════════════════════════════╗
║ ┌──┐                                    ║
║ │🔸│  12 days paid time off             ║  ← Softened bg-amber-500/85
║ └──┘  Available to book                 ║  ← Smaller 16px icon
║       rounded-2xl, shadow-sm            ║  ← Subtle depth
╚═════════════════════════════════════════╝
```

## Hover Effect (Inherited)

The SummaryItem doesn't need hover effects as it's informational, not interactive. The parent Card component already has hover styling from the base Card component.

## Technical Notes

- **Opacity-based softening**: Using `/85` or `/90` opacity modifiers reduces saturation without changing hue
- **Amber vs Orange**: `bg-amber-500` is a warmer, less aggressive orange tone
- **Icon proportion**: Reducing from 20px to 16px with 36px container maintains proper visual balance
- **Shadow-sm**: Adds `0 1px 2px 0 rgb(0 0 0 / 0.05)` for subtle depth
- **Rounded-2xl**: 16px border radius matches the global card system

## Unchanged Elements

- Card content structure (days, label, sublabel)
- Padding and spacing
- Typography (text-xl for numbers, text-sm for sublabel)
- White text color
- Parent Card wrapper styling

