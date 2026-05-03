## Goal
Simplify `BentoCard` to use a solid surface with a subtle border (no glassmorphism, no dark-mode white overlays, no hover blur). Keep `liquidGlass` / `liquidGlassSecondary` button variants intact for auth/CTA usage.

## Findings
- `BentoCard.tsx` currently stacks white-translucent backgrounds, responsive `backdrop-blur`, white borders, and a hover that swaps both bg and blur intensity.
- `button.tsx` defines `liquidGlass` and `liquidGlassSecondary` variants (and matching sizes). They are correctly defined and need no changes.
- A repo-wide search for `liquidGlass` returned no consumers. Per instructions, do not modify consumers in this prompt — and there are none to touch regardless.
- `--surface` and `--border` tokens already exist in `src/index.css` (light: white surface / off-white border; dark: dark surface / dark border).

## Changes

### `src/components/dashboard/bento/BentoCard.tsx`
Replace only the className block that handles surface/border/blur/hover. Leave `colSpanClasses`, padding (`!noPadding && "p-4 sm:p-5"`), `onClick`, role, and tabIndex untouched.

Replace lines 49–59:
```tsx
className={cn(
  // Base Liquid Glass styling - responsive blur/shadow
  "rounded-2xl border border-white/40 dark:border-white/15",
  "bg-white/80 dark:bg-white/10",
  "backdrop-blur-sm sm:backdrop-blur-md",
  "shadow-[0_3px_8px_rgba(0,0,0,0.03)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
  "hover:bg-white/90 dark:hover:bg-white/15 hover:border-white/50 dark:hover:border-white/20",
  "hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] sm:hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
  "transition-all duration-200",
```
with:
```tsx
className={cn(
  // Solid surface with subtle border - no glass, no blur
  "rounded-2xl border border-border bg-surface shadow-sm",
  // Quiet hover - shadow only
  "hover:shadow-md",
  "transition-shadow duration-200",
```

Also update the JSDoc summary above the component (line 16) from "LiquidGlass V2 styled card…" to "Bento Grid card with a solid surface and subtle border." for accuracy.

### `src/components/ui/button.tsx`
No changes. `liquidGlass` and `liquidGlassSecondary` variants and their sizes remain exactly as defined.

## Notes
- `bg-surface` resolves to white (light) / dark surface (dark) — no white overlays in dark mode.
- `border-border` and `shadow-sm`/`shadow-md` are existing tokens, fully aligned with DGC tokens.
- This memory rule "Liquid Glass UI: Elevated surfaces use bg-white/90 … backdrop-blur-lg" no longer applies to `BentoCard`. The user explicitly directed this change; I will note the divergence but not re-record a contradicting memory until the broader pattern is decided.
