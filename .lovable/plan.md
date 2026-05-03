## Goal
Widen the default content width from 1152px to 1200px and let `MyProfile` inherit the layout width by removing its inner `max-w-5xl` wrappers.

## Findings
- `src/components/dashboard/DashboardLayout.tsx:42` — single hard-coded `max-w-[1152px]` (only when `!fullWidth`).
- `src/index.css` — `.container-page` (1400px) and `.container-content` (1200px) utilities already align with the new target width.
- `tailwind.config.ts` — `maxWidth.content: "1200px"`, `maxWidth.page: "1400px"` already exist; no token change required.
- `src/pages/MyProfile.tsx` — three nested `max-w-5xl mx-auto` wrappers (lines 24, 63, 88) constrain the page below the layout width. Removing them lets the layout's max-width govern.

## Changes

### 1. `src/components/dashboard/DashboardLayout.tsx` (line 42)
```diff
-              !fullWidth && "max-w-[1152px]"
+              !fullWidth && "max-w-[1200px]"
```

### 2. `src/pages/MyProfile.tsx`
Drop the inner `max-w-5xl mx-auto` wrappers (skeleton, error state, main render) so the page fills the layout's 1200px content area. Preserve all `space-y-*` spacing.

- Line 24: `<div className="max-w-5xl mx-auto space-y-6">` → `<div className="space-y-6">`
- Lines 63–71: remove the `<div className="max-w-5xl mx-auto">` wrapper around the "Profile Not Found" block (keep inner flex column).
- Line 88: `<div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">` → `<div className="space-y-4 sm:space-y-6">`

## Out of scope
- No other pages' wrappers touched.
- No changes to `index.css` utilities or `tailwind.config.ts` tokens (already at 1200/1400).
- `fullWidth` branch of `DashboardLayout` unchanged.
