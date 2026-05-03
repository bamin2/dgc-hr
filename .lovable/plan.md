## Goal
Route the Header user menu's "Profile" item to `/my-profile` instead of `/employees/${currentUser.id}`.

## Findings
- `src/components/dashboard/Header.tsx:117` — Profile DropdownMenuItem currently navigates to `'/employees/' + currentUser.id`.
- `/my-profile` route is registered in `src/components/AnimatedRoutes.tsx` and renders `MyProfile` (confirmed by existing memory and route conventions).
- Icon (`User`) and label ("Profile") stay unchanged.

## Change in `src/components/dashboard/Header.tsx` (line 117)

```diff
-              <DropdownMenuItem onClick={() => navigate('/employees/' + currentUser.id)}>
+              <DropdownMenuItem onClick={() => navigate('/my-profile')}>
```

## Out of scope
- Sidebar, route guards, AnimatedRoutes table.
- Other DropdownMenuItems (Settings, Sign Out, etc.).
- `currentUser` usage elsewhere in the file.
