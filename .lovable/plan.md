
# UI Consistency Pass - Normalization Plan

## Overview
This plan identifies inconsistencies across UI components and normalizes them to follow the established Liquid Glass design system. The focus is on surface styling, border radius, shadows, spacing, typography, and removing pure solid backgrounds.

## Audit Findings

### Current Design Standards (Correct)

Based on exploration, these components correctly implement the Liquid Glass system:

| Component | Surface | Border | Shadow | Status |
|-----------|---------|--------|--------|--------|
| Card | `bg-white/80 dark:bg-white/10 backdrop-blur-md` | `border-white/40 dark:border-white/15` | `shadow-[0_4px_12px_rgba(0,0,0,0.04)]` | Correct |
| Dialog | `bg-white/90 dark:bg-white/15 backdrop-blur-lg` | `border-white/40 dark:border-white/15` | `shadow-[0_8px_30px_rgba(0,0,0,0.08)]` | Correct |
| Popover | `bg-white/90 dark:bg-white/15 backdrop-blur-lg` | `border-white/40 dark:border-white/15` | `shadow-[0_8px_30px_rgba(0,0,0,0.08)]` | Correct |
| Dropdown | `bg-white/90 dark:bg-white/15 backdrop-blur-lg` | `border-white/40 dark:border-white/15` | `shadow-[0_8px_30px_rgba(0,0,0,0.08)]` | Correct |
| Select | `bg-white/90 dark:bg-white/15 backdrop-blur-lg` | `border-white/40 dark:border-white/15` | `shadow-[0_8px_30px_rgba(0,0,0,0.08)]` | Correct |
| Sheet | `bg-white/95 dark:bg-[hsl(168_35%_10%)]/95 backdrop-blur-lg` | (edge borders) | `shadow-[0_8px_30px_rgba(0,0,0,0.08)]` | Correct |
| Drawer | `bg-white/95 dark:bg-[hsl(168_35%_10%)]/95 backdrop-blur-lg` | `border-white/40 dark:border-white/15` | `shadow-[0_-8px_30px_rgba(0,0,0,0.08)]` | Correct |

### Issues Found - Components Needing Normalization

#### 1. AlertDialogContent - Uses Pure `bg-background`
**File:** `src/components/ui/alert-dialog.tsx`
**Current:** `border bg-background p-6 shadow-lg`
**Issue:** Uses solid `bg-background` instead of glass surface, generic `border` instead of translucent border
**Fix:** Apply glass styling consistent with Dialog

#### 2. TooltipContent - Uses Pure `bg-popover`
**File:** `src/components/ui/tooltip.tsx`
**Current:** `rounded-lg border bg-popover`
**Issue:** Uses solid `bg-popover` and generic `border`
**Fix:** Apply elevated glass styling with translucent border

#### 3. HoverCardContent - Uses Pure `bg-popover`
**File:** `src/components/ui/hover-card.tsx`
**Current:** `rounded-md border bg-popover p-4 shadow-md`
**Issue:** Uses solid `bg-popover`, `rounded-md` (inconsistent), generic `border`, weak `shadow-md`
**Fix:** Apply glass styling with `rounded-lg` and proper shadow

#### 4. ContextMenuContent/SubContent - Uses Pure `bg-popover`
**File:** `src/components/ui/context-menu.tsx`
**Current:** `rounded-md border bg-popover p-1 shadow-md`
**Issue:** Uses solid `bg-popover`, `rounded-md`, generic `border`, weak shadow
**Fix:** Apply glass styling with `rounded-lg` and proper shadow

#### 5. MenubarContent/SubContent - Uses Pure `bg-popover`
**File:** `src/components/ui/menubar.tsx`
**Current:** `rounded-md border bg-popover p-1 shadow-md`
**Issue:** Uses solid `bg-popover`, `rounded-md`, generic `border`
**Fix:** Apply glass styling with `rounded-lg` and proper shadow

#### 6. NavigationMenuViewport - Uses Pure `bg-popover`
**File:** `src/components/ui/navigation-menu.tsx`
**Current:** `rounded-md border bg-popover shadow-lg`
**Issue:** Uses solid `bg-popover`, `rounded-md`
**Fix:** Apply glass styling with `rounded-lg`

#### 7. Inner Item Radius Inconsistency
**Files:** Multiple menu components
**Current:** `rounded-sm` on menu items (ContextMenu, Menubar)
**Issue:** Inconsistent with `rounded-md` used in DropdownMenu and Select items
**Fix:** Normalize all inner items to `rounded-md`

## Implementation Plan

### Step 1: Fix AlertDialogContent
**File:** `src/components/ui/alert-dialog.tsx`

Update lines 36-37:
```tsx
// FROM:
"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 ..."

// TO:
"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-5 border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] duration-200 ..."
```

Changes:
- `gap-4` -> `gap-5` (consistent with Dialog)
- `border` -> `border border-white/40 dark:border-white/15`
- `bg-background` -> `bg-white/90 dark:bg-white/15 backdrop-blur-lg`
- `shadow-lg` -> `shadow-[0_8px_30px_rgba(0,0,0,0.08)]`

### Step 2: Fix TooltipContent
**File:** `src/components/ui/tooltip.tsx`

Update line 19-20:
```tsx
// FROM:
"z-50 overflow-hidden rounded-lg border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md ..."

// TO:
"z-50 overflow-hidden rounded-lg border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg px-3 py-1.5 text-sm text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)] ..."
```

Changes:
- `border` -> `border border-white/40 dark:border-white/15`
- `bg-popover` -> `bg-white/90 dark:bg-white/15 backdrop-blur-lg`
- `shadow-md` -> `shadow-[0_8px_30px_rgba(0,0,0,0.08)]`

### Step 3: Fix HoverCardContent
**File:** `src/components/ui/hover-card.tsx`

Update line 18-19:
```tsx
// FROM:
"z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md ..."

// TO:
"z-50 w-64 rounded-lg border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg p-4 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)] ..."
```

Changes:
- `rounded-md` -> `rounded-lg`
- `border` -> `border border-white/40 dark:border-white/15`
- `bg-popover` -> `bg-white/90 dark:bg-white/15 backdrop-blur-lg`
- `shadow-md` -> `shadow-[0_8px_30px_rgba(0,0,0,0.08)]`

### Step 4: Fix ContextMenuContent and SubContent
**File:** `src/components/ui/context-menu.tsx`

Update ContextMenuSubContent (lines 46-47):
```tsx
// FROM:
"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ..."

// TO:
"z-50 min-w-[8rem] overflow-hidden rounded-lg border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg p-1 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)] ..."
```

Update ContextMenuContent (lines 62-63) - same changes

Update inner item radius:
- ContextMenuSubTrigger (line 28): `rounded-sm` -> `rounded-md`
- ContextMenuItem (line 81): `rounded-sm` -> `rounded-md`
- ContextMenuCheckboxItem (line 97): `rounded-sm` -> `rounded-md`
- ContextMenuRadioItem (line 120): `rounded-sm` -> `rounded-md`

### Step 5: Fix MenubarContent and SubContent
**File:** `src/components/ui/menubar.tsx`

Update MenubarSubContent (lines 71-72):
```tsx
// FROM:
"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground ..."

// TO:
"z-50 min-w-[8rem] overflow-hidden rounded-lg border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg p-1 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)] ..."
```

Update MenubarContent (lines 90-91) - same changes

Update inner item radius:
- MenubarTrigger (line 36): `rounded-sm` -> `rounded-md`
- MenubarSubTrigger (line 53): `rounded-sm` -> `rounded-md`
- MenubarItem (line 109): `rounded-sm` -> `rounded-md`
- MenubarCheckboxItem (line 125): `rounded-sm` -> `rounded-md`
- MenubarRadioItem (line 148): `rounded-sm` -> `rounded-md`

### Step 6: Fix NavigationMenuViewport
**File:** `src/components/ui/navigation-menu.tsx`

Update lines 82-83:
```tsx
// FROM:
"origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg ..."

// TO:
"origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-lg border border-white/40 dark:border-white/15 bg-white/90 dark:bg-white/15 backdrop-blur-lg text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.08)] ..."
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/alert-dialog.tsx` | Apply glass surface, translucent border, proper shadow |
| `src/components/ui/tooltip.tsx` | Apply glass surface, translucent border, proper shadow |
| `src/components/ui/hover-card.tsx` | Fix radius, apply glass surface, translucent border, proper shadow |
| `src/components/ui/context-menu.tsx` | Fix radius, apply glass surface, normalize inner item radius |
| `src/components/ui/menubar.tsx` | Fix radius, apply glass surface, normalize inner item radius |
| `src/components/ui/navigation-menu.tsx` | Fix radius, apply glass surface |

## Visual Summary

```text
Before (Inconsistent):
┌──────────────────────────────────────────────────────────────────────┐
│ AlertDialog: bg-background, border, shadow-lg                        │
│ Tooltip: bg-popover, border, shadow-md                               │
│ HoverCard: rounded-md, bg-popover, border, shadow-md                 │
│ ContextMenu: rounded-md, bg-popover, rounded-sm items                │
│ Menubar: rounded-md, bg-popover, rounded-sm items                    │
│ NavigationMenu: rounded-md, bg-popover                               │
└──────────────────────────────────────────────────────────────────────┘

After (Normalized):
┌──────────────────────────────────────────────────────────────────────┐
│ AlertDialog: bg-white/90 dark:bg-white/15, backdrop-blur-lg          │
│              border-white/40, shadow-[0_8px_30px_rgba(0,0,0,0.08)]   │
│                                                                      │
│ Tooltip: bg-white/90 dark:bg-white/15, backdrop-blur-lg              │
│          border-white/40, shadow-[0_8px_30px_rgba(0,0,0,0.08)]       │
│                                                                      │
│ HoverCard: rounded-lg, bg-white/90, backdrop-blur-lg                 │
│            border-white/40, shadow-[0_8px_30px_rgba(0,0,0,0.08)]     │
│                                                                      │
│ ContextMenu: rounded-lg, bg-white/90, rounded-md items               │
│              border-white/40, shadow-[0_8px_30px_rgba(0,0,0,0.08)]   │
│                                                                      │
│ Menubar: rounded-lg, bg-white/90, rounded-md items                   │
│          border-white/40, shadow-[0_8px_30px_rgba(0,0,0,0.08)]       │
│                                                                      │
│ NavigationMenu: rounded-lg, bg-white/90, backdrop-blur-lg            │
│                 border-white/40, shadow-[0_8px_30px_rgba(0,0,0,0.08)]│
└──────────────────────────────────────────────────────────────────────┘
```

## Technical Notes

### Glass Surface Pattern (Elevated)
For popovers, dropdowns, tooltips, and menus:
```
bg-white/90 dark:bg-white/15 backdrop-blur-lg
border border-white/40 dark:border-white/15
shadow-[0_8px_30px_rgba(0,0,0,0.08)]
rounded-lg
```

### Border Radius Hierarchy
- Outer containers: `rounded-lg` (12px) or `rounded-xl` (16px)
- Inner interactive items: `rounded-md` (8px)
- Never use `rounded-sm` (4px) for menu items

### Items Not Changed (Already Correct)
- Card, Dialog, Popover, DropdownMenu, Select, Sheet, Drawer
- Input, Textarea (use `bg-background` appropriately for form fields)
- Table, Badge, Tabs, Calendar

### Components Using `bg-card`
Many feature components use `bg-card` which resolves to the correct card styling via CSS variables. These are correct as-is since `bg-card` maps to `hsl(var(--card))` which is properly themed.

## Unchanged Elements
- Form field backgrounds (`bg-background` is appropriate for inputs)
- Existing correct glass surfaces
- Component logic and behavior
- Spacing that already follows the 8pt grid
- Typography classes
