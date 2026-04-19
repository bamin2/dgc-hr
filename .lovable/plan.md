

The user wants to:
1. Replace the sidebar logo with the new "DGC People" logo
2. Update PWA icons (192px, 512px) for install on mobile/desktop
3. Rename "DGC Core" → "DGC People" everywhere it appears

Let me check where "DGC Core" / "DGC CORE" appears and where the sidebar logo lives.

Key locations from context:
- `public/manifest.json` — name, short_name, description
- `index.html` — title, og:title, twitter:title, apple-mobile-web-app-title, description
- `src/components/auth/AuthLeftPanel.tsx` — "DGC Core" label + logo
- `src/components/dashboard/Sidebar.tsx` — uses logo from `useCompanySettings` (likely user-managed) but also has a fallback
- `src/components/dashboard/MobileNav.tsx` — also renders logo
- `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`, `public/icons/apple-touch-icon.png`
- `public/dgc-logo-pwa.svg`

I need to verify a few things before finalizing:

# Plan: Rebrand to "DGC People" + new logo & PWA icons

## Assets to add
Copy the uploaded files into the project:
- `user-uploads://Portal_Logos_DGC_people_-_512px_x_512px.png` → `public/icons/icon-512x512.png` (replaces existing)
- `user-uploads://Portal_Logos_DGC_people_-_192px_x_192px.png` → `public/icons/icon-192x192.png` (replaces existing)
- 192px PNG also → `public/icons/apple-touch-icon.png` (180px slot — close enough; iOS will scale)
- `user-uploads://Portal_Logos_DGC_people_-_512px_x_512px.svg` → `src/assets/dgc-people-logo.svg` (used in sidebar / auth panel)
- Same SVG → `public/dgc-logo-pwa.svg` (replace) for any direct references

## Text rename: "DGC Core" / "DGC CORE" → "DGC People"
| File | Change |
|------|--------|
| `public/manifest.json` | `name`, `short_name` → "DGC People"; update `description` |
| `index.html` | `<title>`, `apple-mobile-web-app-title`, og/twitter titles, descriptions |
| `src/components/auth/AuthLeftPanel.tsx` | "DGC Core" subtitle text → "DGC People" |
| `src/components/pwa/InstallPrompt.tsx` | "Install DGC CORE" → "Install DGC People" |

I'll also `code--search_files` for any other occurrences of "DGC Core"/"DGC CORE" to catch stragglers (e.g., page titles, email templates, settings defaults) and update them in the same pass.

## Logo swap in UI
The sidebar logo is driven by `useCompanySettings()` (user-uploaded brand logo). I will **not** override the user's uploaded company logo in the database. Instead:
- Update the **fallback/default logo** asset used in `Sidebar.tsx`, `MobileNav.tsx`, and `AuthLeftPanel.tsx` to the new DGC People SVG. I'll inspect those files to confirm the import paths and swap `dgc-logo-light.svg` / `dgc-logo-dark.svg` references where appropriate.

If the sidebar is currently showing the old logo because it's stored in company settings (DB), I'll mention the user needs to re-upload via Settings → Branding. Otherwise the new asset will appear immediately.

## PWA install icon
Replacing `public/icons/icon-192x192.png` and `icon-512x512.png` is sufficient — `manifest.json` already references those paths. Users who already installed will need to reinstall to see the new icon.

## Files to modify/create
- Replace: `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`, `public/icons/apple-touch-icon.png`, `public/dgc-logo-pwa.svg`
- Create: `src/assets/dgc-people-logo.svg`
- Edit: `public/manifest.json`, `index.html`, `src/components/auth/AuthLeftPanel.tsx`, `src/components/pwa/InstallPrompt.tsx`, `src/components/dashboard/Sidebar.tsx`, `src/components/dashboard/MobileNav.tsx` (logo asset import)
- Sweep: any other "DGC Core"/"DGC CORE" string occurrences

