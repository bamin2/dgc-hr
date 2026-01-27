
# Add Quick Actions Section to Mobile Home Page

## Overview
Add a "Quick Actions" section to the mobile dashboard between the greeting card and notifications. This will provide quick access to common employee actions through a 2-column grid of tappable tiles.

---

## Current Mobile Dashboard Structure
```text
┌─────────────────────────────┐
│ MobileGreetingCard          │
│ "Good morning, John!"       │
│ "Monday, January 27"        │
├─────────────────────────────┤
│ MobileStatusCards           │
│ (Next Leave, Pending, Loan) │
├─────────────────────────────┤
│ NotificationsCard           │
│ (4 recent notifications)    │
└─────────────────────────────┘
```

## Proposed Structure
```text
┌─────────────────────────────┐
│ MobileGreetingCard          │
├─────────────────────────────┤
│ MobileStatusCards           │
├─────────────────────────────┤
│ Quick Actions (NEW)         │
│ ┌──────────┬──────────┐     │
│ │Time Off  │ Loan     │     │
│ ├──────────┼──────────┤     │
│ │Payslip   │ HR Letter│     │
│ ├──────────┼──────────┤     │
│ │Approvals*│Directory*│     │
│ └──────────┴──────────┘     │
│ *Manager/HR only            │
├─────────────────────────────┤
│ NotificationsCard           │
└─────────────────────────────┘
```

---

## Actions Configuration

### Always Visible (All Employees)
| Action | Icon | Behavior |
|--------|------|----------|
| Request Time Off | `CalendarPlus` | Opens `RequestTimeOffDialog` |
| Request Loan | `Banknote` | Opens `EmployeeRequestLoanDialog` |
| View Payslip | `Receipt` | Opens `MobilePayslipsSheet` drawer |
| Request HR Letter | `FileText` | Opens `RequestHRDocumentDialog` |

### Conditional (Manager/HR Only)
| Action | Icon | Behavior | Condition |
|--------|------|----------|-----------|
| Approvals | `CheckSquare` | Navigate to `/approvals` | `isManager` OR `canEditEmployees` |
| Directory | `BookUser` | Navigate to `/directory` | `isManager` OR `canEditEmployees` |

---

## Technical Implementation

### File to Modify
**`src/components/dashboard/bento/MobileQuickActionsCard.tsx`**

This component already exists but includes a greeting section. We will refactor it to:
1. Remove the greeting (already handled by `MobileGreetingCard`)
2. Add section title "Quick Actions"
3. Update actions to match requirements
4. Add role-based conditional actions
5. Add payslips sheet support

### Tile Styling (Reusing Existing Patterns)
Following the pattern from `MobileNewRequestSheet`:
```text
- 2-column grid: grid-cols-2 gap-3
- Min height: min-h-[88px] (meets 56px+ requirement)
- Border radius: rounded-2xl
- Background: bg-secondary/50
- Touch: touch-manipulation, active:scale-[0.98]
- Icon container: h-11 w-11 rounded-xl
- Label: text-xs font-medium
```

### Dashboard Integration
**`src/components/dashboard/DashboardRenderer.tsx`**

Update the `MobileDashboard` function to include the new Quick Actions section:

```text
MobileGreetingCard
    ↓
MobileStatusCards
    ↓
MobileQuickActionsCard (ADD HERE)
    ↓
NotificationsCard
```

---

## Detailed Changes

### 1. Refactor MobileQuickActionsCard.tsx

**Changes:**
- Remove the greeting section (lines 74-80)
- Add section header "Quick Actions"
- Replace actions array with new configuration:
  - Request Time Off → `RequestTimeOffDialog`
  - Request Loan → `EmployeeRequestLoanDialog`
  - View Payslip → `MobilePayslipsSheet`
  - Request HR Letter → `RequestHRDocumentDialog`
- Add conditional actions using `useRole()`:
  - Approvals → `navigate('/approvals')`
  - Directory → `navigate('/directory')`
- Add state for payslips sheet and loan dialog
- Import `useRole` and `useMyEmployee` for role checks and employee ID

**Imports to add:**
- `Banknote`, `Receipt`, `CheckSquare`, `BookUser` from lucide-react
- `useRole` from RoleContext
- `useMyEmployee` from hooks
- `EmployeeRequestLoanDialog` from loans
- `MobilePayslipsSheet` from myprofile/mobile

### 2. Update DashboardRenderer.tsx

**Changes:**
- Import `MobileQuickActionsCard` (already exported in index.ts)
- Add it to the `MobileDashboard` function between `MobileStatusCards` and `NotificationsCard`

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/dashboard/bento/MobileQuickActionsCard.tsx` | Refactor to new design |
| `src/components/dashboard/DashboardRenderer.tsx` | Add MobileQuickActionsCard |

---

## Design Tokens (Following Mobile Standards)
- Grid gap: `gap-3` (12px)
- Card padding: `p-4` (16px)
- Border radius: `rounded-2xl` (16-20px)
- Min touch height: `min-h-[88px]` (exceeds 56px requirement)
- Icon container: `h-11 w-11 rounded-xl` (44px, follows mobile standard)
- Typography: `text-xs font-medium` for labels

## Role Check Logic
```text
const showManagerActions = isManager || canEditEmployees;
```

This covers:
- Managers (role === 'manager')
- HR (role === 'hr')
- Admins (role === 'admin')
