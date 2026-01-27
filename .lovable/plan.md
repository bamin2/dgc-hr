
# Enhance List and Table Row Interactions

## Overview
Add subtle hover effects to existing table rows and list items to improve visual feedback and depth. This creates a more interactive feel without converting any tables into cards or changing row heights.

## Design Specifications

### Hover Effect Values
```text
Property              Current State              Enhanced State
──────────────────────────────────────────────────────────────────
Background            hover:bg-muted/30-50       hover:bg-white/60
Shadow                (none)                     hover:shadow-sm
Transition            (varies)                   transition-all duration-200
Row Height            (unchanged)                (unchanged)
```

### Alignment with Design System
The new hover effect (`bg-white/60 shadow-sm`) aligns with the existing liquid glass aesthetic:
- Cards already use `bg-white/80` with `shadow-[0_4px_12px_rgba(0,0,0,0.04)]`
- Buttons use `bg-white/60` with `backdrop-blur-sm`
- This creates a subtle "lift" effect consistent with the glass surface system

## Implementation Plan

### Step 1: Update Core TableRow Component

**File:** `src/components/ui/table.tsx`

Update the base `TableRow` component to include the enhanced hover effect:

| Property | Current | Updated |
|----------|---------|---------|
| Hover background | `hover:bg-muted/50` | `hover:bg-white/60 dark:hover:bg-white/10` |
| Hover shadow | (none) | `hover:shadow-sm` |
| Transition | `transition-colors` | `transition-all duration-200` |

This change propagates to all TableRow usages automatically.

### Step 2: Update Approval Cards

Cards used for approval workflows should have enhanced interactivity:

**File:** `src/components/approvals/ApprovalCard.tsx`

Add hover effect to the main Card wrapper (for time_off and loan sections):
- Line 49: Add `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm` to Card
- Line 160: Add same hover effect to loan Card

**File:** `src/components/approvals/MobileApprovalCard.tsx`

Add hover effect to all Card wrappers:
- Line 51: Time off Card
- Line 167: Business trip Card  
- Line 249: Loan Card

### Step 3: Update Request Cards

**File:** `src/components/requests/MobileRequestCard.tsx`

Update the button wrapper with enhanced hover:
- Line 92-97: Add `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

### Step 4: Update Trip Card

**File:** `src/components/business-trips/TripCard.tsx`

The TripCard already has `hover:shadow-md`, update to use consistent styling:
- Line 20-22: Change from `hover:shadow-md hover:border-primary/30` to include `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

### Step 5: Update DataCard Component

**File:** `src/components/ui/data-card.tsx`

Update the DataCard component for consistent hover:
- Line 94-99: Update hover class from `hover:shadow-md` to `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

### Step 6: Update List Item Rows

Various components use inline list item styling. Update these to use consistent hover:

**File:** `src/components/settings/payroll/BanksSection.tsx`
- Line 85: Change `hover:bg-muted/50` to `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

**File:** `src/pages/CandidateDetail.tsx`
- Line 164: Change `hover:bg-muted/50` to `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

**File:** `src/components/timemanagement/CopyYearHolidaysDialog.tsx`
- Line 148: Change `hover:bg-muted/50` to `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

**File:** `src/components/employees/EmployeeTimeOffTab.tsx`
- Line 178: Change `hover:border-primary/50` to `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

**File:** `src/components/payroll/PayrollRunWizard/SelectEmployeesStep.tsx`
- Line 92: Change `hover:bg-muted/50` to `hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm`

### Step 7: Update Profile Section Items

**File:** `src/components/myprofile/MyProfilePayslipsSection.tsx`
- Line 165: Update hover from `hover:bg-muted/70` to include shadow effect

**File:** `src/components/myprofile/MyProfileHRLettersSection.tsx`
- Lines 83, 161: Update hover from `hover:bg-muted/70` to include shadow effect

### Step 8: Update Leave Request Card in All Pending Approvals

**File:** `src/components/approvals/AllPendingApprovalsTab.tsx`

Update the LeaveRequestCard component:
- Line 206: Add hover effect to Card component

## Files to Modify

### Core Components
| File | Changes |
|------|---------|
| `src/components/ui/table.tsx` | Update TableRow base hover styles |
| `src/components/ui/data-card.tsx` | Update DataCard hover styles |

### Approval Components
| File | Changes |
|------|---------|
| `src/components/approvals/ApprovalCard.tsx` | Add hover effect to Cards |
| `src/components/approvals/MobileApprovalCard.tsx` | Add hover effect to all Cards |
| `src/components/approvals/AllPendingApprovalsTab.tsx` | Add hover to LeaveRequestCard |

### Request Components
| File | Changes |
|------|---------|
| `src/components/requests/MobileRequestCard.tsx` | Enhance button hover |

### Business Trips
| File | Changes |
|------|---------|
| `src/components/business-trips/TripCard.tsx` | Update hover styling |

### List Item Components
| File | Changes |
|------|---------|
| `src/components/settings/payroll/BanksSection.tsx` | Update row hover |
| `src/pages/CandidateDetail.tsx` | Update offer row hover |
| `src/components/timemanagement/CopyYearHolidaysDialog.tsx` | Update holiday row hover |
| `src/components/employees/EmployeeTimeOffTab.tsx` | Update balance card hover |
| `src/components/payroll/PayrollRunWizard/SelectEmployeesStep.tsx` | Update employee row hover |
| `src/components/myprofile/MyProfilePayslipsSection.tsx` | Update payslip row hover |
| `src/components/myprofile/MyProfileHRLettersSection.tsx` | Update letter row hover |

## Visual Comparison

```text
Before (Table Row):
┌────────────────────────────────────────────────┐
│  Row content                                   │
│  ───────────────────────────────────────────── │
│  bg-muted/50 on hover (flat appearance)        │
└────────────────────────────────────────────────┘

After (Table Row):
┌────────────────────────────────────────────────┐
│  Row content                                   │  ← shadow-sm
│  ───────────────────────────────────────────── │
│  bg-white/60 + subtle lift effect              │
└────────────────────────────────────────────────┘

Before (Card/List Item):
┌────────────────────────────────────────────────┐
│  Card content                                  │
│  No visual feedback on hover                   │
└────────────────────────────────────────────────┘

After (Card/List Item):
╔════════════════════════════════════════════════╗
║  Card content                                  ║  ← shadow-sm
║  Glass background + subtle elevation           ║
╚════════════════════════════════════════════════╝
```

## Hover Effect Hierarchy

```text
Level 1: Table Rows
  └─ hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm

Level 2: Approval/Request Cards
  └─ hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm

Level 3: List Items (inline rows)
  └─ hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm

Level 4: Data Cards (mobile table replacement)
  └─ hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm
```

## Technical Notes

- **Cascading Effect**: Changes to `table.tsx` will automatically update all table rows
- **Dark Mode**: All hover effects include dark mode variants (`dark:hover:bg-white/10`)
- **Transition**: Using `transition-all duration-200` for smooth effect
- **Shadow**: Using `shadow-sm` (Tailwind's subtle shadow: `0 1px 2px 0 rgb(0 0 0 / 0.05)`)
- **Consistency**: All interactive rows now use the same glass-inspired hover pattern

## Unchanged Elements

- Table structure (no conversion to cards)
- Row heights (kept as-is)
- Table headers (maintain distinct styling)
- Non-interactive rows (static content)
- Card container styling (only inner hover behavior enhanced)
