## Plan

Fix the `/auth` page so the left-side brand panel stays DGC Green from the first paint through hydration and after company settings load.

## What I found

- `AuthLeftPanel` currently uses `bg-primary`.
- `--primary` starts as DGC Green in `src/index.css`.
- After the app loads, `CompanySettingsProvider` reads `company_settings.primary_color` and writes it into global CSS variables including `--primary`.
- That runtime branding update is why the panel briefly appears green, then switches to gold.

## Changes to implement

1. **Create auth-specific brand tokens that are not overwritten by company settings**
   - Add stable CSS variables in `src/index.css`, such as:
     - `--auth-brand-panel: 168 48% 11%` for DGC Green
     - `--auth-brand-panel-foreground: 48 21% 97%` for off-white text
   - These remain independent from global `--primary`, so runtime company branding cannot change the auth panel background.

2. **Update `AuthLeftPanel` to use the auth-specific token**
   - Replace `bg-primary` with an arbitrary Tailwind token like `bg-[hsl(var(--auth-brand-panel))]`.
   - Replace panel text and divider usages of `text-primary-foreground` / `bg-primary-foreground` with auth-specific foreground tokens where appropriate.
   - Keep the accent next to “People” consistent with the DGC design system and visible on the green background.

3. **Add early CSS initialization for the `/auth` route**
   - Add a small inline script in `index.html` before the React bundle runs.
   - If the current path is `/auth`, it sets an attribute such as `data-auth-route="true"` and initializes auth CSS variables immediately on `document.documentElement`.
   - This ensures the browser has the correct DGC Green variables before React hydration or async settings fetches occur.

4. **Avoid affecting the rest of the app**
   - Leave the existing company branding behavior intact for dashboard/settings areas.
   - Do not remove `CompanySettingsProvider`; only ensure the auth panel is not tied to the mutable global `--primary` variable.

## Technical notes

- Primary cause: `src/contexts/CompanySettingsContext.tsx` calls `document.documentElement.style.setProperty('--primary', hslValue)` after DB settings load.
- The fix is to decouple the auth hero panel from global `--primary` rather than fighting the settings provider.
- Files expected to change:
  - `index.html`
  - `src/index.css`
  - `src/components/auth/AuthLeftPanel.tsx`

## Verification

After implementation, verify that:
- `/auth` left panel renders DGC Green immediately.
- The panel does not switch to gold after company settings finish loading.
- Text remains readable and aligned with DGC brand colors.
- Other app areas can still use the company-configured primary color where intended.