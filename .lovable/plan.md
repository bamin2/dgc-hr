

# Refine Employee Directory Cards

## Overview
Enhance the DirectoryCard component with refined visual styling that aligns with the liquid glass design system. This includes a softer custom shadow, subtle hover elevation increase, and a very gentle scale effect for a premium feel.

## Current State Analysis

The DirectoryCard currently uses the base Card component with a simple override:
```tsx
<Card className="hover:shadow-md transition-shadow">
```

The base Card component already has:
- `bg-white/80 dark:bg-white/10` - Semi-transparent surface ✓
- `backdrop-blur-md` - Backdrop blur ✓
- `shadow-[0_4px_12px_rgba(0,0,0,0.04)]` - Base shadow
- `hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]` - Hover shadow
- `transition-all duration-200` - Smooth transitions

## Design Specifications

### Requested Changes
```text
Property              Current Value                    Updated Value
──────────────────────────────────────────────────────────────────────────────
Base Shadow           shadow-[0_4px_12px...0.04]       shadow-[0_6px_20px_rgba(0,0,0,0.05)]
Hover Shadow          hover:shadow-md (overridden)     hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]
Hover Scale           (none)                           hover:scale-[1.01]
Hover Translate       (none)                           hover:-translate-y-0.5
Surface               bg-white/80 (from Card)          bg-white/80 (keep)
Backdrop              backdrop-blur-md (from Card)     backdrop-blur-md (keep)
```

### Visual Effect
- **At rest**: Soft, floating appearance with subtle shadow
- **On hover**: Card gently lifts with increased elevation and very slight scale
- **Transition**: Smooth 200ms animation for all properties

## Implementation Plan

### Step 1: Update DirectoryCard Component

**File:** `src/components/directory/DirectoryCard.tsx`

Update the Card className to include:
1. Custom base shadow: `shadow-[0_6px_20px_rgba(0,0,0,0.05)]`
2. Enhanced hover shadow: `hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]`
3. Subtle scale on hover: `hover:scale-[1.01]`
4. Slight lift on hover: `hover:-translate-y-0.5`
5. Smooth transition: `transition-all duration-200`

**Current code (line 24):**
```tsx
<Card className="hover:shadow-md transition-shadow">
```

**Updated code:**
```tsx
<Card className="shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-200">
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/directory/DirectoryCard.tsx` | Update Card className with refined shadow and hover effects |

## Visual Comparison

```text
Before (DirectoryCard):
┌─────────────────────────────────────┐
│       ┌──────────────────┐          │
│       │  Avatar          │          │
│       └──────────────────┘          │
│         Employee Name               │
│         Position                    │
│       ┌─Department Badge─┐          │
│       └──────────────────┘          │
│  shadow-md on hover (flat lift)     │
└─────────────────────────────────────┘

After (DirectoryCard):
╔═════════════════════════════════════╗
║       ┌──────────────────┐          ║  ← Softer shadow
║       │  Avatar          │          ║
║       └──────────────────┘          ║
║         Employee Name               ║
║         Position                    ║
║       ┌─Department Badge─┐          ║
║       └──────────────────┘          ║
║  Gentle lift + subtle scale (1.01)  ║  ← On hover
╚═════════════════════════════════════╝
   └── Increased shadow depth
```

## Hover Effect Details

```text
                    Rest State              Hover State
                    ──────────              ───────────
Shadow Y-offset     6px                     12px
Shadow Blur         20px                    32px  
Shadow Opacity      0.05                    0.08
Scale               1.0                     1.01
Y-translate         0                       -2px (translate-y-0.5)
```

## Technical Notes

- **Transform origin**: Default center, scale effect will expand evenly
- **Max scale 1.01**: Very subtle, prevents jarring movement
- **translate-y-0.5**: Slight upward lift (2px) to complement shadow
- **Grid unaffected**: Transform doesn't affect layout flow
- **Content unchanged**: Only the Card wrapper styling is modified
- **Dark mode**: Inherits dark mode styles from base Card component

## Unchanged Elements

- Grid layout (1/2/3/4 columns responsive)
- Card content (Avatar, name, position, department badge)
- Card padding and spacing
- Typography
- Badge styling
- Avatar sizing

