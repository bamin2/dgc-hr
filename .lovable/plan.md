

# Enhance Cards with Subtle Elevation and Interaction

## Overview
Add subtle hover elevation effects to card components, creating a premium feel where cards gently lift on hover while maintaining minimal, refined interactions.

## Design Specifications

### Shadow Values
```text
Default State:    shadow-[0_4px_12px_rgba(0,0,0,0.04)]
                  - 4px vertical offset (subtle lift)
                  - 12px blur (tight, focused)
                  - 4% opacity (barely visible)

Hover State:      shadow-[0_12px_30px_rgba(0,0,0,0.06)]  
                  - 12px vertical offset (more pronounced)
                  - 30px blur (softer, more diffused)
                  - 6% opacity (slightly stronger)
```

### Interaction Style
- Smooth transition: `transition-all duration-200`
- Desktop-only hover (touch devices show default state)
- No scale effects or animations
- Subtle background opacity increase on hover for glass effect

## Implementation Plan

### Step 1: Update Card Component

**File:** `src/components/ui/card.tsx`

Update the base Card className from:
```tsx
"rounded-xl border border-white/40 dark:border-white/15 bg-white/80 dark:bg-white/10 backdrop-blur-md text-card-foreground shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
```

To:
```tsx
"rounded-xl border border-white/40 dark:border-white/15 bg-white/80 dark:bg-white/10 backdrop-blur-md text-card-foreground shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-white/50 dark:hover:border-white/20 transition-all duration-200"
```

**Changes:**
- Default shadow reduced from `0_8px_30px` to `0_4px_12px` for subtler base elevation
- Added hover shadow `0_12px_30px` with slightly stronger opacity (6%)
- Added hover border enhancement for glass effect
- Added `transition-all duration-200` for smooth state changes

### Step 2: Update BentoCard Component

**File:** `src/components/dashboard/bento/BentoCard.tsx`

Update the shadow values to match the new specification:

Current:
```tsx
"shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
"hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
```

Updated:
```tsx
"shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
"hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
```

This aligns BentoCard with the new Card shadow values for consistency.

### Step 3: Update CSS Utility Classes

**File:** `src/index.css`

Update the `.surface-glass` utility class shadow to match:

Current:
```css
.surface-glass {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}
```

Updated:
```css
.surface-glass {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 200ms;
}

.surface-glass:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/card.tsx` | Add hover shadow, border enhancement, and transition |
| `src/components/dashboard/bento/BentoCard.tsx` | Update default shadow to match new values |
| `src/index.css` | Update `.surface-glass` utility with new shadows and hover state |

## Visual Result

```text
Default State:                    Hover State (Desktop):
┌─────────────────────┐           ┌─────────────────────┐
│                     │           │                     │
│   Card Content      │           │   Card Content      │
│                     │           │                     │
└─────────────────────┘           └─────────────────────┘
       ░░░░░░░░                         ░░░░░░░░░░░░░
    (subtle shadow)                (deeper, softer shadow)
```

## Technical Notes

- **Mobile/Touch Devices**: Hover states won't trigger on touch, so cards maintain their default elegant appearance
- **Performance**: Using `transition-all` is acceptable here as the changes are minimal (shadow, border opacity)
- **Consistency**: All card-like surfaces will share the same elevation language
- **No Scale Effects**: Per requirements, cards do not grow or shrink - only shadow depth changes

