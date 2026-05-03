## Goal
Replace the minimal `CardSkeleton` in `src/components/dashboard/DashboardRenderer.tsx` with a richer placeholder that resembles real bento card content (avatar + title + stacked content bars), and add a second column of bars for wide cards (`colSpan >= 6`).

## Findings
- `CardSkeleton` lives at `src/components/dashboard/DashboardRenderer.tsx:19` and is the only file affected.
- It's used at colSpans 4, 5, 7, 8, 12 in the desktop loading state. The `>= 6` rule covers 7, 8, 12 (wide); 4 and 5 stay single-column.
- `Skeleton` (`src/components/ui/skeleton.tsx`) is `bg-muted` + `animate-pulse` — already a DGC token. No changes needed there.
- `BentoCard`/`BentoGrid` untouched.

## Change

In `src/components/dashboard/DashboardRenderer.tsx` replace lines 19–28:

```tsx
function CardSkeleton({ colSpan = 4 }: { colSpan?: 4 | 5 | 7 | 8 | 12 }) {
  const isWide = colSpan >= 6;

  const BarColumn = () => (
    <div className="space-y-3">
      <Skeleton className="h-3 w-[60%] rounded-full" />
      <Skeleton className="h-3 w-[45%] rounded-full" />
      <Skeleton className="h-3 w-[35%] rounded-full" />
    </div>
  );

  return (
    <BentoCard colSpan={colSpan}>
      <div className="space-y-5">
        {/* Header: 32px avatar + 120px title bar */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-[120px] rounded-full" />
        </div>

        {/* Content bars: single column, or two columns when wide */}
        <div className={isWide ? "grid grid-cols-2 gap-6" : ""}>
          <BarColumn />
          {isWide && <BarColumn />}
        </div>
      </div>
    </BentoCard>
  );
}
```

Notes:
- 32px avatar = `h-8 w-8`; 120px title = `w-[120px]`.
- 12px vertical gap between bars = `space-y-3` (Tailwind 3 = 0.75rem = 12px).
- Bars use `rounded-full` for refined polish; `h-3` for subtle weight.
- Wide cards split into 2 columns (`grid grid-cols-2 gap-6`), each rendering an identical BarColumn.

## Out of scope
- `BentoGrid`, `BentoCard`, all real card components.
- `Skeleton` primitive in `src/components/ui/skeleton.tsx`.
- Mobile dashboard loading state.
