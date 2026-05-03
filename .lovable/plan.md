## Goal
Add a global, visually hidden screen-reader live region in `App.tsx` and a tiny `useScreenReaderAnnounce` hook that writes into it (with a 2s clear). Visible toaster behavior stays untouched.

## Findings
- `src/App.tsx` mounts `<Toaster />` (legacy) then `<Sonner />` at lines 32–33. The new live region goes immediately under `<Sonner />`.
- `src/components/ui/sonner.tsx` is a thin wrapper around the `sonner` library — no changes needed.
- `src/components/ui/toaster.tsx` is the legacy toaster — no changes needed.
- `sr-only` Tailwind utility is available globally (shadcn default).

## Changes

### 1. `src/App.tsx` — insert the live region under `<Sonner />` (lines 32–35)

```tsx
<Toaster />
<Sonner />
<div
  id="sr-announce-region"
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  className="sr-only"
/>
<OfflineIndicator />
<InstallPrompt />
```

Notes:
- `aria-live="assertive"` + `role="alert"` per spec.
- `aria-atomic="true"` ensures the full message is read on each update.
- `sr-only` keeps it visually hidden; no layout impact.

### 2. New file `src/hooks/useScreenReaderAnnounce.ts`

```ts
import { useEffect } from "react";

export const SR_ANNOUNCE_REGION_ID = "sr-announce-region";

/**
 * Writes `message` into the global screen reader live region
 * rendered in App.tsx. Clears it 2s later so repeats re-announce.
 * Pass falsy to skip.
 */
export function useScreenReaderAnnounce(message: string | null | undefined): void {
  useEffect(() => {
    if (!message) return;

    const region = document.getElementById(SR_ANNOUNCE_REGION_ID);
    if (!region) return;

    region.textContent = message;

    const timeout = window.setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = "";
      }
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [message]);
}
```

Notes:
- DOM-write (not React state) so it never re-renders any tree.
- Conditional clear avoids wiping a newer message when a stale timeout fires.
- Cleanup cancels pending clears on unmount/message change.

## Out of scope
- `src/components/ui/sonner.tsx` and `src/components/ui/toaster.tsx` — untouched.
- No existing `toast(...)` call sites are modified.
- No new toast styling, no new providers, no DGC token changes.
