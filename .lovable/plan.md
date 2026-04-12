

# Fix Stacked Loan Balance Card on Mobile Dashboard

## Problem
The Loan Balance card renders as a full-width (`col-span-2`) card on its own row below the two status cards, creating an awkward isolated box. It should be part of the same grid row as the other status cards.

## Solution
Change the layout from a 2-column grid with a full-width loan card to a 3-column grid when loans exist. All three cards (Next Leave, Pending, Loan Balance) sit side by side in one row. The loan card loses its `col-span-2` wrapper and becomes a regular grid item.

When there's no loan, keep the current 2-column layout.

## Technical Change

**File: `src/components/dashboard/bento/MobileStatusCards.tsx`**

Change the grid from `grid-cols-2` to `grid-cols-3` when `hasLoan` is true, and remove the `col-span-2` wrapper div around the Loan Balance card so it renders as a normal grid cell alongside the other two.

The StatusCard `min-h-[88px]` stays the same -- the cards will be narrower but still readable at ~33% width on mobile (roughly 115px each at 390px viewport minus padding/gaps).

## Files to modify

| File | Change |
|------|--------|
| `src/components/dashboard/bento/MobileStatusCards.tsx` | Use `grid-cols-3` when loan exists, remove `col-span-2` wrapper on loan card |

