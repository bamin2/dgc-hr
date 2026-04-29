## Goal

Make route navigation feel native on mobile by adding directional slide transitions, with a subtle fade on desktop. Use framer-motion's `AnimatePresence` keyed on the route path.

## Approach

1. **Add `framer-motion`** as a dependency (already widely used, ~25kb gzipped, tree-shakable).
2. **Create `<AnimatedRoutes>`** in `src/components/AnimatedRoutes.tsx`:
   - Uses `useLocation()` + `AnimatePresence mode="wait"`.
   - Wraps each route's element in a `<motion.div>` keyed by `location.pathname`.
   - Tracks navigation direction via a small `useNavigationDirection` hook that listens to `history.state.idx` (React Router v6 increments this on push, decrements on back) — push → slide from right, pop → slide from left.
   - Desktop (>= md): subtle fade + 6px Y translate (matches existing `page-in` keyframe feel).
   - Mobile (< md): horizontal slide-in-from-right on forward, slide-out-to-right on back. Uses `useIsMobile()`.
   - Honors `prefers-reduced-motion` → falls back to instant change (no animation).
3. **Wire into `App.tsx`**: replace the current `<Routes>` block with `<AnimatedRoutes />`. The route table moves into `AnimatedRoutes` so `AnimatePresence` can see route changes. All existing `ProtectedRoute` / `MobileRestrictedRoute` / `DashboardLazyPage` wrappers stay intact.
4. **Performance guards**:
   - `mode="wait"` ensures only one route renders at a time (no layout overlap, no double data fetches).
   - Transition duration: 220ms mobile slide, 180ms desktop fade — matches existing `cubic-bezier(0.2, 0.6, 0.2, 1)` easing already in `index.css`.
   - `will-change: transform, opacity` only during transition.
   - Animations disabled inside iframes / when reduced-motion is set.
5. **Auth pages excluded**: `/auth`, `/auth/reset-password`, `/email-action-result` render outside `AnimatedRoutes` (or with fade only) — slide transitions on the login screen feel weird.

## Technical details

**New files:**
- `src/components/AnimatedRoutes.tsx` — owns the route table + `AnimatePresence`.
- `src/hooks/useNavigationDirection.ts` — reads `window.history.state?.idx` on each location change, compares to previous, returns `'forward' | 'back' | 'replace'`.

**Edited files:**
- `src/App.tsx` — replace inline `<Routes>` with `<AnimatedRoutes />`. Keep the auth/public routes either inside (with fade variant) or as a separate non-animated `<Routes>` group above.
- `package.json` — add `framer-motion`.

**Variant sketch:**

```ts
const mobileVariants = {
  initial: (dir) => ({ x: dir === 'back' ? '-30%' : '100%', opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit:    (dir) => ({ x: dir === 'back' ? '100%' : '-30%', opacity: 0 }),
};
const desktopVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};
```

Transition: `{ duration: isMobile ? 0.22 : 0.18, ease: [0.2, 0.6, 0.2, 1] }`.

## Out of scope

- No shared-element transitions (would require per-page coordination).
- No swipe-to-go-back gesture (separate, larger feature).
- The existing `.page-enter` utility and per-component `animate-fade-up` stay as-is — they animate content *inside* a page, the new system animates the page boundary.
