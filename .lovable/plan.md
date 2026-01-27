
# LiquidGlass Primary Button Variant Implementation

## Overview
Create a premium "LiquidGlass" button variant that provides a sophisticated, glassmorphism-inspired look for primary call-to-action buttons. This variant will be implemented as a new `variant` option in the existing shadcn Button component, allowing seamless adoption across the app.

## Design Specifications

### Visual Properties
```text
+------------------------------------------+
|                                          |
|      LiquidGlass Button                  |  <- White text (#FFFFFF)
|                                          |
+------------------------------------------+
         ^                          ^
         |                          |
   20px rounded              Gradient fill
   corners                   #18171C → #312F37
```

- **Border Radius**: 20px (`rounded-[20px]`)
- **Text**: White (#FFFFFF), font-medium weight
- **Fill**: Linear gradient from #18171C (top) to #312F37 (bottom)
- **Border**: 1px solid #18171C
- **Inner Shadow**: 0px 4px 4px rgba(255,255,255,0.15) inset
- **Drop Shadow 1**: 0px 2px 4px rgba(1,1,1,0.15)
- **Drop Shadow 2**: 0px 4px 4px rgba(180,178,189,1) with approximate -3px spread (using blur reduction technique)

### Interaction States
- **Hover**: Slight brightness increase + lift effect (`translateY(-1px)`)
- **Pressed/Active**: Push down (`translateY(1px)`) + reduced shadow
- **Focus**: Subtle ring using brand gold (#C6A45E) at low opacity
- **Disabled**: Standard 50% opacity with no pointer events

### Responsive Sizing
- **Mobile**: Height ~48px (`h-12`)
- **Desktop**: Height ~52px (`h-13` or custom `52px`)
- **Horizontal Padding**: 20-24px (`px-5` to `px-6`)

## Implementation Plan

### Step 1: Add New Button Variant
Modify `src/components/ui/button.tsx` to add the `liquidGlass` variant with all required styles.

**Changes:**
- Add new `liquidGlass` variant to the `buttonVariants` CVA definition
- Include gradient background, shadows, border, and text styling
- Add transition for smooth hover/active state changes

### Step 2: Add Custom CSS for Complex Shadow Effects
Add CSS utility class in `src/index.css` for the complex multi-layer shadow effect that cannot be fully expressed in Tailwind alone.

**New CSS class:**
```css
.btn-liquid-glass-shadow {
  box-shadow: 
    inset 0px 4px 4px rgba(255,255,255,0.15),
    0px 2px 4px rgba(1,1,1,0.15),
    0px 1px 2px rgba(180,178,189,0.6);
}
```

### Step 3: Add Size Variant for LiquidGlass
Add a new size option `liquidGlass` that provides the responsive height (48px mobile, 52px desktop) and appropriate padding.

### Step 4: Apply to Primary CTAs
Update key primary CTA buttons to use the new variant. Target locations include:

**Quick Actions (Dashboard):**
- `PersonalQuickActions.tsx`: "Request Time Off" button
- `AdminQuickActions.tsx`: "Run Payroll" button

**Page Headers:**
- `TimeOff.tsx`: "Request time off" button
- Other page-level primary CTAs

**Form Dialogs (Primary Submit Buttons):**
- `RequestTimeOffDialog.tsx`: "Request time off" submit button
- `ApprovalActionDialog.tsx`: "Approve" button
- `MobileApprovalSheet.tsx`: "Approve Request" button

## Technical Details

### Button Variant Definition
```typescript
liquidGlass: [
  // Base gradient and text
  "bg-gradient-to-b from-[#18171C] to-[#312F37]",
  "text-white font-medium",
  // Border
  "border border-[#18171C]",
  // Complex shadows via CSS class
  "btn-liquid-glass-shadow",
  // Rounded corners
  "rounded-[20px]",
  // Transitions
  "transition-all duration-200",
  // Hover state
  "hover:brightness-110 hover:-translate-y-px hover:shadow-lg",
  // Active/pressed state
  "active:translate-y-px active:shadow-md",
].join(" ")
```

### Size Variant Definition
```typescript
liquidGlass: "h-12 sm:h-13 px-5 sm:px-6 text-sm sm:text-base"
```

### Focus Ring Styling
```css
focus-visible:ring-2 focus-visible:ring-[#C6A45E]/40 focus-visible:ring-offset-2
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/button.tsx` | Add `liquidGlass` variant and size |
| `src/index.css` | Add `.btn-liquid-glass-shadow` utility class |
| `src/components/dashboard/personal/PersonalQuickActions.tsx` | Update "Request Time Off" to use `liquidGlass` variant |
| `src/components/dashboard/admin/AdminQuickActions.tsx` | Update "Run Payroll" to use `liquidGlass` variant |
| `src/pages/TimeOff.tsx` | Update page header button to use `liquidGlass` variant |
| `src/components/timeoff/RequestTimeOffDialog.tsx` | Update submit button |
| `src/components/approvals/ApprovalActionDialog.tsx` | Update "Approve" button |
| `src/components/approvals/MobileApprovalSheet.tsx` | Update "Approve Request" button |

## Usage Example
```tsx
// Primary CTA with LiquidGlass styling
<Button variant="liquidGlass" size="liquidGlass">
  Get Started
</Button>

// In a form dialog footer
<Button variant="liquidGlass">
  Save Changes
</Button>
```

## Rollout Strategy
1. Implement the variant in the Button component first
2. Add CSS shadow utilities
3. Apply to a few key CTAs (Quick Actions, Time Off page)
4. Verify visual consistency across light/dark modes
5. Gradually roll out to other primary CTAs as needed

## Notes
- Secondary buttons (`variant="outline"`, `variant="ghost"`) remain unchanged
- The variant is additive and does not break existing button usage
- Dark mode compatibility: The gradient colors work well in both themes
