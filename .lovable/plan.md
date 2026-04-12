

# Fix Mobile Dashboard Card Overlap & Width Issues

## Problem
- `MobileStatusCards` uses a raw `col-span-12` class, but `BentoGrid` is `grid-cols-1` on mobile. Spanning 12 columns in a 1-column grid causes layout breakage and overlap with adjacent cards.
- `MobileGreetingCard` uses `<BentoCard colSpan={12}>` which correctly maps to `col-span-1` on mobile, but may appear not full-width due to the broken grid from the sibling.

## Fix

### File: `src/components/dashboard/bento/MobileStatusCards.tsx`
- Change `col-span-12` to `col-span-1` on both the loading and loaded wrapper divs. Since this component is only rendered on mobile (inside `MobileDashboard`), `col-span-1` in a `grid-cols-1` grid = full width. This is consistent with how `BentoCard colSpan={12}` maps on mobile.

**Lines 75 and 102**: Replace `col-span-12` with `col-span-1`.

## Files to modify

| File | Change |
|------|--------|
| `src/components/dashboard/bento/MobileStatusCards.tsx` | Change `col-span-12` → `col-span-1` on wrapper divs (lines 75, 102) |

