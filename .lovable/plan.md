

The user is hitting the production custom domain `hr.dgcholding.com` in a regular browser tab and still seeing the old logo + missing Import button. The PWA fix we already shipped only helps once the browser actually loads the new HTML/JS. If the production deploy hasn't been updated, or if the browser is still being handed an old cached `index.html` by the previously-installed service worker on that origin, nothing changes.

Two things to verify/fix:

## 1. Production must be republished

Lovable backend changes auto-deploy, but **frontend changes only go live on the published URL after clicking "Publish → Update"**. The custom domain `hr.dgcholding.com` serves the published build. If it hasn't been republished since the logo swap and the Import Leave History button were added, the live site will keep showing the old version no matter how many times you reload.

**Action (user):** Open the project, click **Publish → Update** in the top right. Wait for the deploy to finish, then hard-reload `hr.dgcholding.com` (Ctrl/Cmd+Shift+R).

## 2. The old service worker is likely still installed on hr.dgcholding.com

Even after republishing, the previous service worker registered on that origin will keep serving the old cached `index.html` and JS bundle to that browser. The self-unregistering stub we shipped will clean it up — but only after the browser fetches the new `sw.js`. On a cache-first SW, the first reload still serves stale; cleanup happens, then the *next* reload shows the new UI.

**Action (user), one-time per browser:**
- Hard-reload twice (Ctrl/Cmd+Shift+R), OR
- DevTools → Application → Service Workers → **Unregister**, then reload, OR
- DevTools → Application → Storage → **Clear site data**, then reload.

After that, the site is permanently clean (no SW will re-register).

## 3. Verify the role

The Import Leave History button is gated by `hasRole('hr') || hasRole('admin')`. Once the new bundle loads, if the button still doesn't appear, the logged-in account doesn't have HR or Admin role on production. Check the role badge in the sidebar — if it says Manager or Employee, the role assignment in the database needs updating.

## No code changes needed

The source code is already correct (logo updated, Import button present, SW stub in place). This is a deploy + browser-cache cleanup, not a code issue.

