

# Fix Mobile Bottom Navigation - Floating Action Button

## Overview
Refactor the mobile bottom navigation so the "+" button becomes a true floating action button (FAB) that overlaps the navigation bar without affecting tab spacing.

---

## Current Issue
```text
┌───────────────────────────────────────────────────┐
│ Home │ Requests │ [+] │ Approvals │ Profile │
└───────────────────────────────────────────────────┘
                    ↑
        Button is a flex item - affects spacing
```

## Target Layout
```text
                   [+]  ← Floating, absolutely positioned
                    │
┌───────────────────│───────────────────────────────┐
│   Home   │  Requests  │  Approvals  │  Profile   │
└───────────────────────────────────────────────────┘
            ↑ Tabs evenly spaced, unaffected by FAB
```

---

## Technical Changes

### File: `src/components/dashboard/MobileActionBar.tsx`

**1. Merge navigation items into single array**

Remove the split between `leftNavItems` and `rightNavItems`. Use a single `navItems` array:

| Tab | Condition |
|-----|-----------|
| Home | Always visible |
| Requests | Always visible |
| Approvals | Only if `canAccessManagement` |
| Profile | Always visible |

**2. Remove the button from the flex flow**

Current structure (problematic):
```text
<div className="flex justify-around">
  {leftNavItems}
  <button>+</button>  ← Takes up flex space
  {rightNavItems}
</div>
```

New structure:
```text
<nav className="relative">  ← Add relative positioning
  <div className="flex justify-around">
    {navItems}  ← All tabs, evenly spaced
  </div>
  <button className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-28px)]">
    +
  </button>  ← Floating, centered, overlaps bar
</nav>
```

**3. FAB positioning details**

| Property | Value | Purpose |
|----------|-------|---------|
| `position` | `absolute` | Remove from document flow |
| `left` | `50%` | Center point at viewport center |
| `transform` | `-translate-x-1/2` | Offset by half width for true centering |
| `bottom` | `calc(100% - 28px)` | Position so button overlaps the nav bar |
| `z-index` | `10` | Ensure button sits above nav items |

**4. Styling adjustments**

The FAB styling remains mostly the same:
- Circular: `rounded-full`
- Size: `w-14 h-14` (56px)
- Color: `bg-[#C6A45E]` (DGC Gold)
- Shadow: `shadow-lg shadow-[#C6A45E]/30`
- Icon: `Plus` with white color

---

## Updated Component Structure

```text
MobileActionBar
├── <Fragment>
│   ├── <nav> (fixed bottom, relative)
│   │   ├── <div> (flex container, justify-around)
│   │   │   ├── Home Link
│   │   │   ├── Requests Link
│   │   │   ├── Approvals Link (conditional)
│   │   │   └── Profile Link
│   │   └── <button> (FAB, absolute positioned)
│   │       └── Plus icon
│   ├── Drawer (Bottom Sheet)
│   └── Request Dialogs
```

---

## Code Changes Summary

### Lines to modify:

**1. Navigation items (lines 91-107)**
- Combine into single `navItems` array
- Remove `leftNavItems` and `rightNavItems` separation

**2. Nav container (lines 168-202)**
- Add `relative` class to nav element
- Change flex container to render all `navItems` without the button
- Move FAB button outside the flex container
- Apply absolute positioning to FAB

### New navItems structure:
```text
const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FileText, label: "Requests", path: "/requests" },
  ...(canAccessManagement ? [{
    icon: CheckSquare,
    label: "Approvals", 
    path: "/approvals",
    badge: pendingCount
  }] : []),
  { icon: User, label: "Profile", path: "/my-profile" },
];
```

### New FAB positioning:
```text
<button
  className={cn(
    "absolute left-1/2 -translate-x-1/2",
    "bottom-[calc(100%-28px)] z-10",
    "w-14 h-14 rounded-full",
    "bg-[#C6A45E] text-white",
    "flex items-center justify-center",
    "shadow-lg shadow-[#C6A45E]/30",
    "touch-manipulation transition-transform duration-150",
    "active:scale-95"
  )}
>
```

---

## Layout Behavior

| Scenario | Tabs | Result |
|----------|------|--------|
| Regular employee | Home, Requests, Profile | 3 tabs evenly spaced |
| Manager/HR | Home, Requests, Approvals, Profile | 4 tabs evenly spaced |

The FAB remains centered at 50% viewport width regardless of tab count.

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/dashboard/MobileActionBar.tsx` | Refactor FAB positioning |

---

## Expected Result

- Navigation tabs (3 or 4) are evenly distributed across the bar
- FAB floats above the navigation bar, centered horizontally
- FAB does not affect tab spacing
- Tapping FAB opens the Requests bottom sheet
- No changes to desktop navigation (component already uses `lg:hidden`)

