## Sidebar Polish — 4 Fixes

Address the four amateur-feeling issues in `src/components/dashboard/Sidebar.tsx`.

### 1. Collapsed-state logo: drop the hand-rolled "D"

Replace the `bg-sidebar-primary` square with hardcoded "D" letter with the actual brand mark from `public/dgc-logo-pwa.svg` (the official square PWA icon, already includes the "DGC" wordmark on the dark green background). Render it as an `<img>` at `w-10 h-10` with `rounded-xl overflow-hidden`. No more white-on-orange improvised letter mark.

### 2. Logo sizing: make expanded ↔ collapsed feel like the same logo

Currently expanded is `h-14` and collapsed is a totally different `w-10 h-10` orange tile. Normalize both states to the same brand mark, just sized differently:
- Expanded: full horizontal `dgc-people-logo.svg` at `h-10` (down from h-14, which is oversized vs. the 80px collapsed rail).
- Collapsed: square `dgc-logo-pwa.svg` at `h-10 w-10`.

Both use the same visual vocabulary (deep green + DGC), so the transition reads as "same logo, smaller" instead of two different brands.

### 3. Sign-out button: replace bare `<LogOut/>` with a dropdown matching Header

Replace the unconfirmed icon-only `LogOut` button (no aria-label, no tooltip, instant sign-out on misclick) with a `DropdownMenu` matching the pattern already used in `src/components/dashboard/Header.tsx` (lines 95–150):

- Trigger: small ghost button with chevron, wrapping the avatar+name area so the whole user block becomes the trigger (collapsed state: just the avatar).
- Menu items: "My Profile" (→ `/my-profile`), "Settings" (→ `/settings`), separator, "Sign out" (→ `useAuth().signOut()`, styled `text-destructive`).
- Wire up `useAuth` (currently not imported in Sidebar) and `useNavigate`.
- Add proper `aria-label="User menu"` on the trigger.

This eliminates the misclick-signs-you-out problem and keeps a single, consistent user menu pattern across header and sidebar.

### 4. Persist collapsed state via `useUserPreferences`, not localStorage

Move sidebar collapsed state into the existing user preferences system so it syncs across devices.

**Schema change** (migration on `user_preferences` table):
- Add column `sidebar_collapsed boolean not null default false`.

**`src/data/settings.ts`**:
- Add `sidebarCollapsed: boolean` to the `display` block of `UserPreferences`.

**`src/hooks/useUserPreferences.ts`**:
- Map `sidebar_collapsed` ↔ `sidebarCollapsed` in `transformFromDb` and the upsert payload.
- Default to `false`.

**`src/components/dashboard/Sidebar.tsx`**:
- Replace `useState`+`localStorage` with `useUserPreferences()`:
  - Read `preferences.display.sidebarCollapsed` for the current value.
  - Call the existing update mutation on toggle (optimistic update so the chevron feels instant).
- Keep a one-time localStorage→DB migration: on mount, if `localStorage.getItem('sidebar-collapsed')` exists and DB value is default, write it to DB and remove the localStorage key.

### Files Modified

- `src/components/dashboard/Sidebar.tsx` — logo swap, dropdown menu, preferences-backed state.
- `src/data/settings.ts` — add `sidebarCollapsed` to display preferences.
- `src/hooks/useUserPreferences.ts` — map new column, include in default.
- New SQL migration — add `sidebar_collapsed` column to `user_preferences`.

### Out of scope

- Redesigning the sidebar layout, colors, or section structure.
- Changing the mobile nav or header.
