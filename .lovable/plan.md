## Goal
Replace the single muted circle in `EmptyState` with a layered visual: gold-tinted outer ring + card-colored inner circle + primary-colored icon. Scale proportionally across `sm` / `default` / `lg`. No prop changes, no consumer changes.

## Findings
- `EmptyState` lives at `src/components/ui/empty-state.tsx`.
- Icon block is lines 78–81; size variant logic uses `iconSizes` (line 58–62).
- Tokens used: `bg-accent` is the DGC gold, `bg-card`, `border-border`, `text-primary` (DGC deep green) — all already in the design system.
- `NoSearchResults` uses `<EmptyState>` and is unaffected (prop interface preserved).

## Sizing scale (proportional)

| size | outer | inner | icon (unchanged) |
|---|---|---|---|
| sm | 72×72 | 56×56 | h-8 w-8 |
| default | 96×96 | 72×72 | h-12 w-12 |
| lg | 120×120 | 88×88 | h-16 w-16 |

## Change

In `src/components/ui/empty-state.tsx`, replace the icon block (lines 78–81) and add two new size maps right after `iconSizes` (line 62). Final structure:

```tsx
const iconSizes = {
  sm: "h-8 w-8",
  default: "h-12 w-12",
  lg: "h-16 w-16",
};

const outerCircleSizes = {
  sm: "h-[72px] w-[72px]",
  default: "h-24 w-24",          // 96px
  lg: "h-[120px] w-[120px]",
};

const innerCircleSizes = {
  sm: "h-14 w-14",                // 56px
  default: "h-[72px] w-[72px]",
  lg: "h-[88px] w-[88px]",
};
```

And the icon block becomes:

```tsx
{/* Layered icon visual: gold-tinted outer ring, card inner circle, primary icon */}
<div
  className={cn(
    "rounded-full bg-accent/10 flex items-center justify-center mb-4",
    outerCircleSizes[size]
  )}
>
  <div
    className={cn(
      "rounded-full bg-card border border-border flex items-center justify-center",
      innerCircleSizes[size]
    )}
  >
    <Icon className={cn("text-primary", iconSizes[size])} />
  </div>
</div>
```

## Notes
- Used `bg-accent/10` instead of `/8` because Tailwind only ships standard opacity steps; `/10` is the closest token-friendly equivalent and visually reads as a quiet gold tint. If the user explicitly wants `/8`, swap to `bg-accent/[0.08]`.
- Prop interface, sizing variant API, padding logic, title/description/actions all untouched.
- `NoSearchResults` consumer continues to work unchanged.
