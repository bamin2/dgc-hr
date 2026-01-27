
# Liquid Glass Surface System - Global Standardization

## Overview
Standardize all page and card surfaces across the application to use a consistent "Liquid Glass" design system. This involves updating CSS variables, modifying core UI components, and adding new utility classes - all without creating new components.

## Design Specifications

### Color Values
```text
Page Background:     #F7F6F3 (soft warm neutral)
                     HSL: 40 15% 96%

Card Background:     bg-white/80 (light mode)
                     bg-white/10 (dark mode - glass effect)

Border:              border-white/40 (translucent white)
                     border-black/5 (light mode subtle)

Shadow:              shadow-[0_8px_30px_rgba(0,0,0,0.04)]
```

### Visual Effect
Cards will "float" above the page with:
- Semi-transparent white backgrounds (not solid white)
- Subtle backdrop blur for depth
- Soft, diffused shadows
- Translucent borders that catch light

## Implementation Plan

### Step 1: Update CSS Variables in `src/index.css`

**Light Mode Changes:**
- Update `--background` from `40 8% 97%` to `40 15% 96%` (#F7F6F3 equivalent)
- Update `--card` from `0 0% 100%` to a semi-transparent equivalent via new approach
- Update `--popover` similarly for floating menus

**New Utility Classes:**
```css
/* Liquid Glass Card Surface */
.surface-glass {
  @apply bg-white/80 dark:bg-white/10 backdrop-blur-md;
  @apply border border-white/40 dark:border-white/15;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

/* Liquid Glass Card Surface - Elevated (for popovers/dropdowns) */
.surface-glass-elevated {
  @apply bg-white/90 dark:bg-white/15 backdrop-blur-lg;
  @apply border border-white/50 dark:border-white/20;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
```

### Step 2: Update Card Component (`src/components/ui/card.tsx`)

**Current:**
```tsx
"rounded-xl border bg-card text-card-foreground shadow-sm"
```

**Updated:**
```tsx
"rounded-xl border border-white/40 dark:border-white/15 bg-white/80 dark:bg-white/10 backdrop-blur-md text-card-foreground shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
```

### Step 3: Update BentoCard Component (`src/components/dashboard/bento/BentoCard.tsx`)

**Current:**
```tsx
"rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-sm"
```

**Updated:**
```tsx
"rounded-2xl border border-white/40 dark:border-white/15 bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
```

### Step 4: Update Dialog Component (`src/components/ui/dialog.tsx`)

Update `dialogContentVariants` base styles:

**Current:**
```tsx
"border bg-background p-6 shadow-lg"
```

**Updated:**
```tsx
"border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
```

### Step 5: Update Sheet Component (`src/components/ui/sheet.tsx`)

Update `sheetVariants` base styles:

**Current:**
```tsx
"bg-background shadow-lg"
```

**Updated:**
```tsx
"bg-white/95 dark:bg-[hsl(168_35%_10%)]/95 backdrop-blur-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
```

### Step 6: Update Popover Component (`src/components/ui/popover.tsx`)

**Current:**
```tsx
"border bg-popover p-4 text-popover-foreground shadow-md"
```

**Updated:**
```tsx
"border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg p-4 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
```

### Step 7: Update Dropdown Menu (`src/components/ui/dropdown-menu.tsx`)

Update `DropdownMenuContent` and `DropdownMenuSubContent`:

**Current:**
```tsx
"border bg-popover p-1 text-popover-foreground shadow-md"
```

**Updated:**
```tsx
"border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg p-1 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
```

### Step 8: Update Select Component (`src/components/ui/select.tsx`)

Update `SelectContent`:

**Current:**
```tsx
"border bg-popover text-popover-foreground shadow-md"
```

**Updated:**
```tsx
"border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
```

### Step 9: Update Settings Card (`src/components/settings/SettingsCard.tsx`)

Ensure it inherits the updated Card styles properly.

**Current:**
```tsx
<Card className={cn('border-border/50', className)}>
```

**Updated:**
```tsx
<Card className={className}>
```
(Relies on updated Card base styles)

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Update `--background` variable, add utility classes |
| `src/components/ui/card.tsx` | Apply glass styling |
| `src/components/dashboard/bento/BentoCard.tsx` | Apply glass styling |
| `src/components/ui/dialog.tsx` | Apply elevated glass styling |
| `src/components/ui/sheet.tsx` | Apply elevated glass styling |
| `src/components/ui/popover.tsx` | Apply elevated glass styling |
| `src/components/ui/dropdown-menu.tsx` | Apply elevated glass styling |
| `src/components/ui/select.tsx` | Apply elevated glass styling |
| `src/components/settings/SettingsCard.tsx` | Remove border override |

## Technical Considerations

### Dark Mode Compatibility
- Light mode: `bg-white/80` provides semi-transparent white
- Dark mode: `bg-white/10` provides subtle glass effect on dark backgrounds
- Borders adapt: `border-white/40` (light) vs `border-white/15` (dark)

### Backdrop Blur Levels
- Cards: `backdrop-blur-md` (moderate blur)
- Elevated surfaces (dialogs, popovers): `backdrop-blur-lg` (stronger blur)

### Shadow Specification
The soft elevation shadow `shadow-[0_8px_30px_rgba(0,0,0,0.04)]`:
- 0px horizontal offset
- 8px vertical offset (creates floating effect)
- 30px blur radius (soft, diffused)
- 4% opacity black (very subtle)

### Performance Note
`backdrop-blur` can impact performance on lower-end devices. The blur values are kept moderate to balance visual quality with performance.

## Visual Result

```text
+----------------------------------------------------------+
|                                                          |
|  ┌─────────────────────────────────────────────────┐    |
|  │                                                 │    |
|  │     Card floats with subtle shadow              │    |
|  │     Semi-transparent white background           │    |
|  │     Backdrop blur shows through                 │    |
|  │                                                 │    |
|  └─────────────────────────────────────────────────┘    |
|                                                          |
|  Soft neutral page background (#F7F6F3)                 |
+----------------------------------------------------------+
```

## Notes
- No new components are created - only existing components modified
- Maintains backward compatibility with all existing usages
- Both light and dark modes are supported with adaptive styling
- Existing `glass` and `glass-subtle` utilities will be updated for consistency
