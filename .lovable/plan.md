

# Plan: Fix stale taskbar icon for installed PWA

## Root cause
Two issues compound here:

1. **Windows caches the installed PWA icon by app identity** (start_url + name). Even if `/icons/icon-512x512.png` is updated on the server, the *already-installed* app keeps the old icon in the Windows icon cache and the Chromium WebAppShortcut store. Reinstalling without changing the manifest identity won't help — Chromium reuses the cached icon file it copied on first install.

2. **`manifest.json` icons use `purpose: "any maskable"`** on both entries. Windows treats maskable icons as silhouettes inside a safe zone and crops aggressively, which can also make the new logo look "wrong" or mistaken for the old one. Maskable should be a *separate* entry, not combined with `any`.

## Changes

**1. `public/manifest.json`** — Split icon purposes and bump identity so Windows treats it as a fresh install on next install:
- Add a `id` field (e.g. `"id": "/?v=2"`) — changing this forces Chromium to refresh icon cache on reinstall.
- Split icons: one set with `purpose: "any"`, one with `purpose: "maskable"` (can reuse same files for now since current PNGs are designed as full-bleed logos, not maskable-safe — better to mark them `any` only and drop maskable until proper safe-zone versions are made).
- Add cache-busting query to icon `src` (`/icons/icon-512x512.png?v=2`) so the browser fetches fresh bytes.

**2. User actions (required, one-time per machine)** — code alone can't evict the Windows icon cache for an already-installed app:
- Right-click the installed DGC People app in Start menu → **Uninstall**.
- In Chrome/Edge: `chrome://apps` → right-click DGC People → **Remove from Chrome**.
- Clear site data: DevTools on `hr.dgcholding.com` → Application → Storage → **Clear site data**.
- Reload `hr.dgcholding.com`, then reinstall via the address bar install icon.
- New taskbar icon will be the updated DGC People logo.

## Files to modify
- `public/manifest.json` — split icon purposes, add `id`, version icon URLs.

No other code changes. The PNG icons in `public/icons/` are already the new logo (regenerated Apr 19) — the issue is purely Windows/Chromium icon caching for the previously installed app.

