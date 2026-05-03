## Goal
Cross-fade the sidebar logo between mark (collapsed) and wordmark (expanded) instead of swapping nodes. Both `<img>`s render at all times, stacked absolutely, with a 200ms opacity transition.

## Findings
- `src/components/dashboard/Sidebar.tsx` lines 135–149 hold the conditional `collapsed ? <img mark> : <img wordmark>` block.
- Surrounding header (line 134: `flex items-center justify-between p-4 border-b border-sidebar-border`) and inner wrapper classes (line 135) stay untouched.
- Mark renders as `h-10 w-10 rounded-xl`. Wordmark renders as `h-10 w-auto`. Sidebar expanded width is `w-60` (240px); after `p-4` (32px) padding, ~208px is available for the wordmark.

## Change in `src/components/dashboard/Sidebar.tsx` (lines 135–149)

Replace with a relatively-positioned container that animates width and stacks both images absolutely with opacity cross-fade:

```tsx
<div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
  <div
    className={cn(
      "relative h-10 transition-[width] duration-200 ease-out",
      collapsed ? "w-10" : "w-[140px]"
    )}
  >
    <img
      src={dgcLogoMark}
      alt="DGC"
      className={cn(
        "absolute inset-y-0 left-0 h-10 w-10 rounded-xl transition-opacity duration-200",
        collapsed ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!collapsed}
    />
    <img
      src={dgcLogoLight}
      alt="DGC Logo"
      className={cn(
        "absolute inset-y-0 left-0 h-10 w-auto transition-opacity duration-200",
        collapsed ? "opacity-0" : "opacity-100"
      )}
      aria-hidden={collapsed}
    />
  </div>
</div>
```

Notes:
- Container is `h-10` (matches both logos) and toggles between `w-10` (mark) and `w-[140px]` (sized to fit the wordmark). 140px is a safe upper bound for the wordmark height/width ratio at h-10; it sits comfortably inside the ~208px available space.
- Both images use `absolute inset-y-0 left-0` so they overlap exactly.
- 200ms `transition-opacity` (and `transition-[width]`) on both, with `ease-out` for refined motion.
- `aria-hidden` flips on the inactive image so screen readers don't double-announce "DGC".

## Out of scope
- Header padding / border (line 134 unchanged).
- Outer flex wrapper class on line 135 unchanged (still centers when collapsed).
- Sidebar widths (`w-20` / `w-60`) and all nav, footer, collapse logic.
