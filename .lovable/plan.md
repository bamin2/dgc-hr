

# Plan: Drop the service worker, keep PWA installable

## Why the previous fix didn't stick
Bumping `CACHE_NAME` only purges the cache *after* the new service worker activates. But the existing SW serves scripts/styles **cache-first**, so on the reload that should bring the new version, the old bundle is served while the new SW installs in the background. You only see the new UI on the *next* reload — and many users (and the OS-installed PWA) never get there because the in-app refresh just re-uses the same cached assets again. Same root cause for the missing Import button: the JS bundle in cache predates that code.

You said you only need installability (Add to Home Screen / install on desktop), not offline. So the cleanest fix is to **remove the service worker entirely**. The manifest alone is enough to keep the app installable, and updates will then always be live.

## Changes

**1. `src/main.tsx`** — Stop registering the SW and proactively unregister any existing one (so installed PWAs self-heal on next open):
```ts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
  caches?.keys().then(keys => keys.forEach(k => caches.delete(k)));
}
```

**2. `public/sw.js`** — Replace contents with a self-unregistering stub so any browser still holding the old `/sw.js` URL cleans itself up:
```js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll();
    clients.forEach(c => c.navigate(c.url));
  })());
});
```

**3. `public/manifest.json`** — No changes. Installability stays.

## Result after deploy
- Installed PWA: on next open, the stub SW unregisters itself, wipes caches, and reloads the window → fresh logo + Import Leave History button appear.
- Browser tabs: same — one reload picks up the latest build, every reload after that is always live.
- App stays installable from the address bar / "Install app" because the manifest is intact.

## Files to modify
- `src/main.tsx` — remove SW registration, add cleanup.
- `public/sw.js` — replace with self-unregistering stub.

No changes to the Leave History import button — it's already gated on `hr` + `admin` correctly. It was hidden only because the cached bundle predated it; this fix unblocks it.

