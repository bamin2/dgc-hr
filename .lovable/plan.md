# Make Sidebar Legacy Migration Run Exactly Once

## Goal
The localStorage → DB migration in `Sidebar.tsx` currently re-reads `localStorage` whenever `preferences.userId` changes and may re-fire if `preferences.display.sidebarCollapsed` is updated externally and the legacy key still exists. Capture the legacy value once on first render and ensure the migration runs at most once.

## File
`src/components/dashboard/Sidebar.tsx` — lines 1 and 88–101 only.

## Changes

### 1. Import `useRef` (line 1)
```ts
import { useEffect, useMemo, useRef } from "react";
```

### 2. Replace the migration block (lines 88–101)
```tsx
// One-time migration: localStorage → DB (read once, run at most once)
const legacySidebarCollapsedRef = useRef<string | null>(
  typeof window !== 'undefined' ? localStorage.getItem('sidebar-collapsed') : null
);

useEffect(() => {
  const legacy = legacySidebarCollapsedRef.current;
  if (legacy === null) return;
  if (!preferences.userId) return;

  const legacyValue = legacy === 'true';
  if (legacyValue !== preferences.display.sidebarCollapsed) {
    updatePreferences({
      display: { ...preferences.display, sidebarCollapsed: legacyValue },
    });
  }
  localStorage.removeItem('sidebar-collapsed');
  legacySidebarCollapsedRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [preferences.userId]);
```

## Behavior
- Legacy value is read **once** on first render via `useRef` initializer.
- The effect short-circuits when the ref is `null` (already migrated) or when `preferences.userId` is falsy.
- `updatePreferences` is only called when (a) legacy is non-null, (b) `userId` is truthy, and (c) the legacy value differs from current `sidebarCollapsed`.
- After running, `localStorage.removeItem` is called and the ref is set to `null`, guaranteeing the effect can never act again even if dependencies change.
- No other Sidebar behavior is touched.

## Files Modified
- `src/components/dashboard/Sidebar.tsx`
