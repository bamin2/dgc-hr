

# Standardize Button Styles Across the App

## Overview
Create a consistent, refined button system where primary actions clearly stand out from secondary actions. This involves updating the core Button component with standardized sizing, refined styling, and ensuring visual hierarchy is maintained throughout the app.

## Design Specifications

### Primary Buttons (liquidGlass)
```text
Property              Current Value                    Updated Value
──────────────────────────────────────────────────────────────────────────────
Height                h-12 sm:h-[52px]                 h-12 (fixed 48px)
Text Size             text-sm sm:text-base             text-sm (fixed)
Gradient              ✓ Keep existing                  ✓ Keep existing
Shadow                Multi-layer with glow effect     Subtle shadows only
Border Radius         rounded-[20px]                   rounded-[20px] (keep)
```

### Secondary/Cancel Buttons (liquidGlassSecondary)
```text
Property              Current Value                    Updated Value
──────────────────────────────────────────────────────────────────────────────
Height                h-11 sm:h-12                     h-12 (match primary)
Background            bg-black/[0.03]                  bg-white/60
Border                border-black/10                  border-white/50
Backdrop              (none)                           backdrop-blur-sm
Shadow                Multi-layer shadows              Minimal/none
Border Radius         rounded-[20px]                   rounded-[20px] (keep)
```

### Outline Buttons (toolbar/secondary actions)
Update `outline` variant for consistency when used alongside liquidGlass buttons:
- Background: `bg-white/60` 
- Border: `border-white/50`
- Backdrop: `backdrop-blur-sm`
- No heavy shadows

## Implementation Plan

### Step 1: Update Button Component Core Variants

**File:** `src/components/ui/button.tsx`

#### Update `liquidGlass` variant:
Change from:
```tsx
liquidGlass: [
  "bg-gradient-to-b from-[#18171C] to-[#312F37]",
  "text-white font-medium",
  "border border-[#18171C]",
  "rounded-[20px]",
  "btn-liquid-glass-shadow",  // Complex multi-layer shadow
  "transition-all duration-200",
  "hover:brightness-110 hover:-translate-y-px hover:btn-liquid-glass-shadow-hover",
  "active:translate-y-px active:btn-liquid-glass-shadow-active",
  "focus-visible:ring-[#C6A45E]/40",
].join(" ")
```

To:
```tsx
liquidGlass: [
  "bg-gradient-to-b from-[#18171C] to-[#312F37]",
  "text-white text-sm font-medium",
  "border border-[#18171C]",
  "rounded-[20px]",
  "shadow-[0_2px_8px_rgba(0,0,0,0.15)]",  // Subtle shadow only
  "transition-all duration-200",
  "hover:brightness-110 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
  "active:translate-y-px active:shadow-[0_1px_4px_rgba(0,0,0,0.1)]",
  "focus-visible:ring-2 focus-visible:ring-[#C6A45E]/40 focus-visible:ring-offset-2",
].join(" ")
```

#### Update `liquidGlassSecondary` variant:
Change from:
```tsx
liquidGlassSecondary: [
  "bg-black/[0.03] dark:bg-white/[0.08]",
  "text-foreground/80 font-medium",
  "border border-black/10 dark:border-white/15",
  "rounded-[20px]",
  "btn-liquid-glass-secondary-shadow",
  ...
].join(" ")
```

To:
```tsx
liquidGlassSecondary: [
  "bg-white/60 dark:bg-white/10",
  "text-foreground font-medium text-sm",
  "border border-white/50 dark:border-white/20",
  "backdrop-blur-sm",
  "rounded-[20px]",
  "transition-all duration-200",
  "hover:bg-white/70 dark:hover:bg-white/15 hover:-translate-y-px",
  "active:translate-y-px",
  "focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2",
].join(" ")
```

#### Update `outline` variant for glass consistency:
Change from:
```tsx
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
```

To:
```tsx
outline: [
  "bg-white/60 dark:bg-white/10",
  "border border-white/50 dark:border-white/20",
  "backdrop-blur-sm",
  "hover:bg-white/70 dark:hover:bg-white/15",
  "hover:text-accent-foreground",
].join(" ")
```

#### Update size variants:
Change from:
```tsx
size: {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-11 w-11",
  "icon-sm": "h-9 w-9",
  liquidGlass: "h-12 sm:h-[52px] px-5 sm:px-6 text-sm sm:text-base",
  liquidGlassSecondary: "h-11 sm:h-12 px-4 sm:px-5 text-sm",
}
```

To:
```tsx
size: {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-12 px-6",  // Updated: h-11 → h-12
  icon: "h-11 w-11",
  "icon-sm": "h-9 w-9",
  liquidGlass: "h-12 px-6",  // Fixed height, consistent padding
  liquidGlassSecondary: "h-12 px-5",  // Match primary height
}
```

### Step 2: Clean Up CSS Shadow Utilities

**File:** `src/index.css`

Remove the complex button shadow utilities that are no longer needed:

Delete these classes:
- `.btn-liquid-glass-shadow`
- `.btn-liquid-glass-shadow-hover`
- `.btn-liquid-glass-shadow-active`
- `.btn-liquid-glass-secondary-shadow`
- `.btn-liquid-glass-secondary-shadow-hover`
- `.btn-liquid-glass-secondary-shadow-active`

### Step 3: Update Dialog Footer Cancel Buttons

Update dialogs that use `variant="outline"` for Cancel to use `liquidGlassSecondary`:

| File | Current | Updated |
|------|---------|---------|
| `src/components/approvals/ApprovalActionDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlassSecondary"` |
| `src/components/approvals/MobileApprovalSheet.tsx` | `variant="outline" className="h-12"` | `variant="liquidGlassSecondary" size="liquidGlassSecondary"` |
| `src/components/calendar/CreateEventDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlassSecondary"` |
| Multiple other dialogs | See Step 5 for full list | Standardize Cancel buttons |

### Step 4: Standardize Primary Action Button Heights

Ensure all primary action buttons use the `liquidGlass` variant with fixed h-12 height:

| File | Location | Change |
|------|----------|--------|
| `src/pages/TimeOff.tsx` | Request Time Off button | Remove `sm:h-[52px]` responsive sizing |
| `src/components/approvals/MobileApprovalSheet.tsx` | Approve button | Use `size="liquidGlass"` for h-12 |
| Various dialogs | Primary action buttons | Ensure `size="liquidGlass"` is used |

### Step 5: Update All Dialog Cancel Buttons

Search and update all dialogs using `variant="outline"` for Cancel to use the new glass style:

Files to update Cancel buttons:
- `src/components/timemanagement/AssignLeaveBalanceDialog.tsx`
- `src/components/settings/organization/WorkLocationFormDialog.tsx`
- `src/components/calendar/CreateEventDialog.tsx`
- `src/components/timemanagement/HolidayFormDialog.tsx`
- `src/components/hiring/offers/OfferFormDialog.tsx`
- `src/components/hiring/jobs/JobFormDialog.tsx`
- `src/components/documents/CreateTemplateDialog.tsx`
- And additional dialogs across the app (~20+ files)

For each Cancel button, change:
```tsx
<Button variant="outline" onClick={() => onOpenChange(false)}>
  Cancel
</Button>
```

To:
```tsx
<Button variant="liquidGlassSecondary" size="liquidGlassSecondary" onClick={() => onOpenChange(false)}>
  Cancel
</Button>
```

### Step 6: Update Destructive Button Styling

The destructive variant should also follow the refined height standard:

**File:** `src/components/ui/button.tsx`

Add height consistency to destructive buttons when used in footers by ensuring components use `size="lg"` (now h-12) for destructive actions:

| File | Change |
|------|--------|
| `src/components/approvals/ApprovalActionDialog.tsx` | Add `size="lg"` to destructive Reject button |
| `src/components/approvals/MobileApprovalSheet.tsx` | Use `className="h-12"` for Reject button |

## Files to Modify

### Core Button Component
| File | Changes |
|------|---------|
| `src/components/ui/button.tsx` | Update liquidGlass, liquidGlassSecondary, outline variants; update sizes |

### CSS
| File | Changes |
|------|---------|
| `src/index.css` | Remove unused button shadow utilities |

### Approval Components
| File | Changes |
|------|---------|
| `src/components/approvals/ApprovalActionDialog.tsx` | Update Cancel and Reject button variants |
| `src/components/approvals/MobileApprovalSheet.tsx` | Update Cancel button, standardize heights |

### Dialog Components (Cancel Button Updates)
| File | Changes |
|------|---------|
| `src/components/calendar/CreateEventDialog.tsx` | Cancel → liquidGlassSecondary |
| `src/components/timemanagement/AssignLeaveBalanceDialog.tsx` | Cancel → liquidGlassSecondary |
| `src/components/timemanagement/HolidayFormDialog.tsx` | Cancel → liquidGlassSecondary |
| `src/components/settings/organization/WorkLocationFormDialog.tsx` | Cancel → liquidGlassSecondary |
| `src/components/hiring/offers/OfferFormDialog.tsx` | Cancel → liquidGlassSecondary |
| `src/components/hiring/jobs/JobFormDialog.tsx` | Cancel → liquidGlassSecondary |
| `src/components/documents/CreateTemplateDialog.tsx` | Cancel → liquidGlassSecondary |
| `src/components/loans/CreateLoanDialog.tsx` | Cancel → liquidGlassSecondary |

## Visual Comparison

```text
Before:                                    After:
┌────────────────────────────────────┐    ┌────────────────────────────────────┐
│  Primary Button                    │    │  Primary Button                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │  ─────────────────────────────────  │
│  Heavy glow, 52px desktop height   │    │  Subtle shadow, fixed 48px height  │
│  Multi-layer box-shadow            │    │  Single-layer soft shadow          │
│  Responsive text sizing            │    │  Fixed text-sm                     │
└────────────────────────────────────┘    └────────────────────────────────────┘

┌────────────────────────────────────┐    ┌────────────────────────────────────┐
│  Secondary Button                  │    │  Secondary Button                  │
│  ──────────────────────────────────│    │  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│  bg-black/3%, solid border         │    │  bg-white/60, glass border         │
│  Visible shadow layers             │    │  backdrop-blur, no shadow          │
│  Doesn't match glass surfaces      │    │  Matches card glass aesthetic      │
└────────────────────────────────────┘    └────────────────────────────────────┘

Visual Hierarchy:
Primary CTA ████████████████████  (Dark gradient, prominent)
Secondary   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (Glass, subtle)
Ghost       ░░░░░░░░░░░░░░░░░░░░  (Minimal, text only)
```

## Button Hierarchy Summary

```text
Level 1: Primary CTA (liquidGlass)
  └─ Dark gradient, h-12, subtle shadow, maximum emphasis

Level 2: Secondary/Cancel (liquidGlassSecondary)
  └─ Glass effect, h-12, backdrop-blur, no shadow

Level 3: Outline (toolbar actions)
  └─ Glass effect, h-10, consistent with secondary

Level 4: Ghost (inline actions)
  └─ Transparent, h-10/h-9, text emphasis only

Level 5: Destructive
  └─ Red background, uses standard sizing
```

## Technical Notes

- **Fixed Heights**: Moving from responsive heights (h-12 sm:h-[52px]) to fixed h-12 for consistency
- **Subtle Shadows**: Single-layer shadows instead of complex multi-layer effects
- **Glass Consistency**: Secondary buttons now match the glass card aesthetic
- **Touch Targets**: All buttons maintain minimum 44px+ touch targets
- **Text Size**: Fixed at text-sm for all variants (no responsive text scaling)

## Unchanged Elements

- Ghost button styling (already minimal and appropriate)
- Icon button sizes (maintain touch targets)
- Link variant styling
- Button border radius (20px maintained)
- Gradient colors in primary buttons

