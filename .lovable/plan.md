

# Plan: Fix stale PWA cache (logo + missing Import button)

## Root cause
Installed PWA is serving from the old service-worker cache `dgc-core-pwa-v2`. The cached `index.html` and JS bundle predate both the logo swap and the Import Leave History button. Source code is already correct — this is purely a cache-bust problem.

## Fix

**1. Bump service worker cache version** (`public/sw.js`)
- Change `CACHE_NAME = 'dgc-core-pwa-v2'` → `'dgc-people-pwa-v3'`.
- The existing `activate` handler already deletes any cache whose name doesn't match `CACHE_NAME`, so old caches (including `dgc-core-pwa-v2`) will be purged automatically on next load.
- `skipWaiting()` + `clients.claim()` are already in place, so the new SW activates immediately.

**2. Add a network-first strategy for `index.html`** (`public/sw.js`)
- Currently navigation requests are network-first but fall back to a cached `index.html`. That's fine — the cache bump above forces a fresh fetch. No additional change needed beyond version bump.

## What the user needs to do
After we deploy:
1. Reload the installed PWA window once (Ctrl/Cmd+R inside the PWA, or close and reopen).
2. The new SW takes over, deletes the old cache, fetches the new bundle → updated logo and Import Leave History button appear.

If it still shows stale content, right-click the PWA → DevTools → Application → Service Workers → Unregister, then reload.

## Files to modify
- `public/sw.js` — bump `CACHE_NAME` to `dgc-people-pwa-v3`.

No other code changes — the React source is already correct.

