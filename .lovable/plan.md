
# Add Central Quick Action Button to Mobile Bottom Navigation

## Overview
Add a prominent circular "Quick Action" button in the center of the mobile bottom navigation bar. Tapping it opens a bottom sheet with request options (Time Off, Loan, HR Letter) as a vertical list.

---

## Current Navigation Structure
```text
┌─────────────────────────────────────────────┐
│  Home  │  Requests  │  Approvals*  │ Profile│
└─────────────────────────────────────────────┘
* Approvals only for Manager/HR
```

## New Navigation Structure
```text
┌─────────────────────────────────────────────────┐
│  Home  │  Requests  │  [+]  │  Approvals*  │ Profile│
└─────────────────────────────────────────────────┘
                        ↑
              Circular gold button
              Opens bottom sheet
```

---

## Quick Action Button Design

| Property | Value |
|----------|-------|
| Shape | Circular (rounded-full) |
| Size | 56px diameter (w-14 h-14) |
| Background | DGC Gold (`bg-[#C6A45E]`) |
| Icon | Plus (Lucide) - white |
| Position | Center of navigation, raised slightly |
| Touch area | Meets 56px minimum requirement |
| Visual effect | Shadow for prominence, scale on active |

---

## Bottom Sheet Content

**Title**: "Requests"

**Layout**: Vertical list with icon + label (not grid)

| Action | Icon | Behavior |
|--------|------|----------|
| Time Off | `Calendar` | Opens `RequestTimeOffDialog` |
| Loan | `Banknote` | Opens `EmployeeRequestLoanDialog` |
| HR Letter | `FileText` | Opens `RequestHRDocumentDialog` |

**Interaction Flow**:
1. User taps Quick Action button
2. Bottom sheet slides up with drag handle
3. User taps an action item
4. Sheet closes immediately
5. Corresponding dialog opens (150ms delay for smooth transition)

---

## Technical Implementation

### Files to Modify

**1. `src/components/dashboard/MobileActionBar.tsx`**

Changes:
- Add state for sheet open/close: `const [sheetOpen, setSheetOpen] = useState(false)`
- Add states for each dialog (time off, loan, HR letter)
- Insert central Quick Action button between navigation items
- Render the bottom sheet (Drawer) with action list
- Render the three request dialogs

**Button implementation**:
```text
- Position: flex item between Home/Requests and Approvals/Profile
- Not a Link (doesn't navigate)
- onClick opens the sheet
- Uses brand gold color (#C6A45E)
- Plus icon centered
- Elevated with shadow-lg
- active:scale-95 for haptic feedback
```

**Sheet implementation (using existing Drawer)**:
```text
- Drawer component (vaul-based)
- DrawerContent with rounded-t-[1.25rem]
- Built-in drag handle (already in component)
- DrawerHeader with title "Requests"
- Vertical list of action buttons
```

---

## Component Structure

```text
MobileActionBar
├── nav (flex container)
│   ├── Home Link
│   ├── Requests Link
│   ├── Quick Action Button (circular, gold)
│   ├── Approvals Link (conditional)
│   └── Profile Link
├── Drawer (Bottom Sheet)
│   ├── DrawerContent
│   │   ├── DrawerHeader → "Requests"
│   │   └── Action List (vertical)
│   │       ├── Time Off row
│   │       ├── Loan row
│   │       └── HR Letter row
├── RequestTimeOffDialog
├── EmployeeRequestLoanDialog
└── RequestHRDocumentDialog
```

---

## Action List Item Styling

Each item in the vertical list:

| Property | Value |
|----------|-------|
| Layout | Horizontal: icon + label |
| Height | min-h-[56px] (meets touch target) |
| Padding | px-4 py-3 |
| Icon container | h-10 w-10 rounded-xl bg-secondary/50 |
| Label | text-base font-medium |
| Separator | border-b between items (except last) |
| Interaction | active:bg-muted/50, touch-manipulation |

---

## Navigation Array Update

Current flow builds `navItems` array, then maps. New approach:
- Split into two groups: left items (Home, Requests) and right items (Approvals, Profile)
- Render left items, then Quick Action button, then right items
- This ensures the circular button is always centered

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/dashboard/MobileActionBar.tsx` | Add Quick Action button + bottom sheet + dialogs |

No new files needed - reusing existing Drawer component and request dialogs.

---

## Imports to Add

```text
- useState from react
- Plus from lucide-react
- Calendar, Banknote, FileText from lucide-react (for sheet icons)
- Drawer, DrawerContent, DrawerHeader, DrawerTitle from @/components/ui/drawer
- RequestTimeOffDialog from @/components/timeoff/RequestTimeOffDialog
- EmployeeRequestLoanDialog from @/components/loans/EmployeeRequestLoanDialog
- RequestHRDocumentDialog from @/components/approvals/RequestHRDocumentDialog
```

---

## Expected Result

- Mobile bottom navigation now has a prominent gold circular Plus button in the center
- Tapping the button opens a bottom sheet titled "Requests"
- Sheet contains a clean vertical list of three actions
- Tapping any action closes the sheet and opens the corresponding form
- Existing navigation tabs (Home, Requests, Approvals, Profile) remain functional
- The design follows mobile design tokens (56px touch targets, rounded-2xl, proper spacing)
