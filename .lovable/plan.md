## Goal
The bottom `MobileActionBar` is the canonical mobile nav. Strip duplicate primary destinations from the `MobileNav` Sheet, drop the "More" expandable wrapper (everything inside the Sheet is now secondary), and re-label the Sheet trigger as "More".

## Findings
- `MobileActionBar` already covers Dashboard, My Profile, Time Off, and Notifications — confirmed; not modified.
- Routes verified: `/directory`, `/projects`, `/calendar`, `/business-trips`, `/settings`, `/help-center` all exist.
- `Plane` (Business Trips) and `Calendar` (Calendar) Lucide icons match the rest of the app's conventions (Sidebar uses `Plane` for Business Trips).
- Profile block (top) and Sign Out button (bottom) stay exactly as-is.

## Changes in `src/components/dashboard/MobileNav.tsx`

1. **Imports (lines 4–17)** — remove `LayoutDashboard`, `Clock`, `Bell`; add `Calendar`, `Plane`. Keep `Menu` (still used as fallback before relabel), or replace with text label (see step 4).

   Final import set:
   ```ts
   import {
     Menu, X, UserCircle, ChevronRight,
     Settings, HelpCircle, BookUser, Briefcase, Calendar, Plane, LogOut,
   } from "lucide-react";
   ```

2. **Menu items (lines 27–41)** — delete `primaryMenuItems` entirely. Replace the `secondaryMenuItems` array with the new ordered list:
   ```ts
   const secondaryMenuItems = [
     { icon: BookUser,   label: "Directory",      path: "/directory" },
     { icon: Briefcase,  label: "Projects",       path: "/projects" },
     { icon: Calendar,   label: "Calendar",       path: "/calendar" },
     { icon: Plane,      label: "Business Trips", path: "/business-trips" },
     { icon: Settings,   label: "Settings",       path: "/settings" },
     { icon: HelpCircle, label: "Help Center",    path: "/help-center" },
   ];
   ```

3. **State (line 86)** — remove `showMore` state and the `setShowMore(false)` line in `handleClose`.

4. **Sheet trigger (lines 109–118)** — change to a labeled "More" button. Auto-width with icon + text:
   ```tsx
   <SheetTrigger asChild>
     <Button
       variant="ghost"
       className="lg:hidden h-11 px-3 gap-2 touch-manipulation"
       aria-label="Open more menu"
     >
       <Menu className="h-5 w-5" />
       <span className="text-sm font-medium">More</span>
     </Button>
   </SheetTrigger>
   ```

5. **Nav body (lines 161–209)** — replace primary loop + "More" expandable wrapper with a single rendered list of `secondaryMenuItems`. Items render with `large` for comfortable touch targets since this is the only list now. No section header needed (the Sheet trigger already says "More"):
   ```tsx
   <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1 min-h-0">
     {secondaryMenuItems.map((item) => (
       <NavItem
         key={item.path}
         icon={item.icon}
         label={item.label}
         path={item.path}
         isActive={location.pathname === item.path}
         onClick={handleClose}
         large
       />
     ))}
   </nav>
   ```

## Out of scope
- `MobileActionBar.tsx` — untouched.
- Logo header, profile block (top of Sheet), Sign Out button (bottom) — untouched.
- `NavItem` component, sidebar styling tokens, role-based gating logic.
