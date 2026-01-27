

# Mobile Status Cards - Navigation Fix

## Summary

The mobile status cards are **already fully implemented** with tappable functionality, pressed states, and navigation. Only a **single line change** is needed to fix the "Pending" card's navigation destination.

---

## Current State (Already Implemented)

The `MobileStatusCards` component already has:

| Feature | Implementation |
|---------|---------------|
| Tappable cards | Cards are `<button>` elements with `onClick` |
| Pressed state | `active:scale-[0.98]` provides subtle scale-down effect |
| Touch optimization | `touch-manipulation` CSS class |
| Smooth transitions | `transition-all duration-150` |
| Full card clickable | No nested buttons, entire card responds to tap |

---

## Current Navigation Routes

| Card | Current Route | Correct Route |
|------|---------------|---------------|
| Next Leave | `/time-off` | `/time-off` ✓ |
| Pending | `/time-off` | `/requests` ✗ |
| Loan Balance | `/my-profile?tab=loans` | `/my-profile?tab=loans` ✓ |

---

## Required Fix

**File:** `src/components/dashboard/bento/MobileStatusCards.tsx`

**Change:** Update line 123 - the "Pending" card's `onClick` handler

```tsx
// Current (line 123):
onClick={() => navigate("/time-off")}

// Fixed:
onClick={() => navigate("/requests")}
```

This aligns with the mobile navigation pattern where:
- The bottom action bar has a "Requests" tab pointing to `/requests`
- The `MobileRequestsHub` component at `/requests` shows all pending requests

---

## No Other Changes Needed

The existing card design with pressed state is already well-implemented:

```tsx
<button
  onClick={onClick}
  className={cn(
    "flex flex-col items-start gap-2 p-4 rounded-2xl",
    "bg-card/80 border border-border/50",
    "hover:bg-card/90 active:scale-[0.98]",  // ← Already has pressed state
    "transition-all duration-150 touch-manipulation",  // ← Already touch optimized
    "min-h-[88px] w-full text-left"
  )}
>
```

---

## Summary

| Task | Status |
|------|--------|
| Make cards tappable | Already done ✓ |
| Add pressed/active state | Already done ✓ |
| No buttons inside cards | Already correct ✓ |
| Entire card clickable | Already done ✓ |
| Fix Pending navigation | Single line change needed |

