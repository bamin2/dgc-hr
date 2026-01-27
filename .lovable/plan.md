
# LiquidGlass Secondary Button Variant Implementation

## Overview
Create a "LiquidGlass Secondary" button variant designed specifically for Cancel actions. This variant will visually complement the existing LiquidGlass Primary button while being clearly lower priority - using translucent glass styling instead of the dark gradient.

## Design Specifications

### Visual Properties
```text
+------------------------------------------+
|                                          |
|      Cancel                              |  <- Neutral text (foreground/80)
|                                          |
+------------------------------------------+
         ^                          ^
         |                          |
   20px rounded              Translucent glass
   corners                   bg-white/8 or bg-black/3
```

- **Border Radius**: 20px (`rounded-[20px]`) - matches primary
- **Text**: Neutral color (`text-foreground/80`), font-medium weight
- **Fill (Dark surfaces)**: `bg-white/8` - subtle glass effect
- **Fill (Light surfaces)**: `bg-black/[0.03]` - very subtle tint
- **Border (Dark)**: 1px solid `rgba(255,255,255,0.15)`
- **Border (Light)**: 1px solid `rgba(0,0,0,0.10)`
- **Inner Shadow**: `0 1px 0 rgba(255,255,255,0.12)` - subtle top highlight
- **Drop Shadow**: `0 2px 6px rgba(0,0,0,0.08)` - soft depth

### Interaction States
- **Hover**: Increase background opacity + lift by 1px (`-translate-y-px`)
- **Pressed/Active**: Push down (`translate-y-px`) + reduce shadow
- **Focus**: Subtle ring (`ring-2`) with low opacity, not aggressive
- **Disabled**: Standard 50% opacity with no pointer events

### Responsive Sizing
- Same as LiquidGlass Primary: Height 48px mobile, 52px desktop
- Horizontal padding: 20-24px (`px-5` to `px-6`)

## Implementation Plan

### Step 1: Add CSS Shadow Utilities
Add new shadow utilities to `src/index.css` for the secondary variant's softer glass effect.

**New CSS classes:**
```css
/* LiquidGlass Secondary (Cancel) button shadows */
.btn-liquid-glass-secondary-shadow {
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 2px 6px rgba(0,0,0,0.08);
}

.btn-liquid-glass-secondary-shadow-hover {
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.18),
    0 4px 8px rgba(0,0,0,0.12);
}

.btn-liquid-glass-secondary-shadow-active {
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.08),
    0 1px 2px rgba(0,0,0,0.06);
}
```

### Step 2: Add Button Variant
Modify `src/components/ui/button.tsx` to add the `liquidGlassSecondary` variant.

**Variant definition:**
```typescript
liquidGlassSecondary: [
  // Translucent glass background - adapts to surface
  "bg-black/[0.03] dark:bg-white/[0.08]",
  // Neutral text
  "text-foreground/80 font-medium",
  // Border adapts to theme
  "border border-black/10 dark:border-white/15",
  // Match primary radius
  "rounded-[20px]",
  // Complex shadows via CSS class
  "btn-liquid-glass-secondary-shadow",
  // Transitions
  "transition-all duration-200",
  // Hover state
  "hover:bg-black/[0.06] dark:hover:bg-white/[0.12] hover:-translate-y-px hover:btn-liquid-glass-secondary-shadow-hover",
  // Active/pressed state
  "active:translate-y-px active:btn-liquid-glass-secondary-shadow-active",
  // Subtle focus ring
  "focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2",
].join(" ")
```

### Step 3: Update AlertDialogCancel Component
Modify `src/components/ui/alert-dialog.tsx` to use the new variant for all Cancel buttons in AlertDialogs.

**Change from:**
```typescript
className={cn(buttonVariants({ variant: "outline" }), className)}
```

**To:**
```typescript
className={cn(buttonVariants({ variant: "liquidGlassSecondary", size: "liquidGlass" }), className)}
```

### Step 4: Update Dialog Cancel Buttons
Update key Dialog components that have Cancel buttons using `variant="outline"`.

**Target files (Cancel buttons only):**

| File | Current | Update to |
|------|---------|-----------|
| `EditSalaryDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `AdHocPaymentDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `EditEnrollmentDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `TripAmendmentDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `CreateProjectDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `PositionFormDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `DepartmentFormDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `BankDetailsDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `RequestTimeOffDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |
| `AttendanceCorrectionDialog.tsx` | `variant="outline"` | `variant="liquidGlassSecondary" size="liquidGlass"` |

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add `.btn-liquid-glass-secondary-shadow` utilities |
| `src/components/ui/button.tsx` | Add `liquidGlassSecondary` variant |
| `src/components/ui/alert-dialog.tsx` | Update `AlertDialogCancel` to use new variant |
| Multiple dialog files | Update Cancel buttons to use new variant |

## Usage Example
```tsx
// Cancel button with LiquidGlass Secondary styling
<Button variant="liquidGlassSecondary" size="liquidGlass">
  Cancel
</Button>

// In a dialog footer (paired with primary)
<DialogFooter>
  <Button variant="liquidGlassSecondary" size="liquidGlass" onClick={handleCancel}>
    Cancel
  </Button>
  <Button variant="liquidGlass" size="liquidGlass" onClick={handleSave}>
    Save Changes
  </Button>
</DialogFooter>
```

## Visual Hierarchy
The two LiquidGlass variants create a clear visual pairing:

```text
Primary (LiquidGlass):          Secondary (LiquidGlassSecondary):
+-------------------+           +-------------------+
| ███████████████ |           |   ░░░░░░░░░░░░   |
| ███ SAVE ███████ |           |   ░ CANCEL ░░░   |
| ███████████████ |           |   ░░░░░░░░░░░░   |
+-------------------+           +-------------------+
     Dark gradient                 Translucent glass
     White text                    Neutral text
     High visual weight            Low visual weight
```

## Notes
- **Destructive buttons unchanged**: Buttons like "Delete" retain their destructive styling
- **Close buttons unchanged**: X icon close buttons in dialog corners are not affected
- **Backwards compatible**: Existing `variant="outline"` continues to work
- **Theme adaptive**: Glass effect adapts between light and dark modes automatically
