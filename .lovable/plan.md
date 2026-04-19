

User wants the logo larger inside the existing sidebar (don't widen sidebar). Also still remove "PEOPLE" subtitle.

# Plan: Bigger logo, remove "PEOPLE" subtitle

**`src/components/dashboard/Sidebar.tsx`**
- Keep sidebar widths unchanged (`w-60` / `w-20`).
- Increase logo size from `h-8` → `h-14` (roughly doubles visual size while staying within the 240px sidebar).
- Remove the `<span>PEOPLE</span>` element. Drop the wrapping `flex flex-col` since only the `<img>` remains.
- Collapsed state "D" badge stays as-is (already fits the 80px collapsed width).

**`src/components/dashboard/MobileNav.tsx`**
- Increase logo from `h-8` → `h-12` for consistency.
- Remove the `<span>PEOPLE</span>` element and the wrapping `flex flex-col`.

No other changes.

