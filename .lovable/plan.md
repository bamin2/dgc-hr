
# Edit Salary Dialog Implementation

## Overview
Add an "Edit Salary" button to the Compensation card in the Employment tab of the Employee Profile page. This button opens a dialog where HR/Admin users can edit all salary components (Basic Salary, Allowances, Deductions, and GOSI Registered Salary). Upon saving, the employee's compensation is updated, and a record is added to the Compensation History.

---

## Current Architecture

The Employee Profile page (`src/pages/EmployeeProfile.tsx`) already:
- Fetches employee allowances via `useEmployeeAllowances(id)`
- Fetches employee deductions via `useEmployeeDeductions(id)`
- Calculates compensation breakdown in a `useMemo` block
- Displays a Compensation card (lines 544-629) with blur-to-reveal privacy overlay
- Has a Salary History card (`SalaryHistoryCard`) that displays compensation changes

Existing patterns for editing:
- `BankDetailsDialog` - Simple dialog for updating employee bank details
- `AddAllowanceDialog` / `AddDeductionDialog` - Dialogs for adding compensation components
- `EmployeeCompensationCard` (bulk salary) - Full compensation editing card with inline allowance/deduction management

---

## Implementation Plan

### 1. Create New Component: `EditSalaryDialog.tsx`

**Location:** `src/components/employees/EditSalaryDialog.tsx`

**Props Interface:**
```typescript
interface EditSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  currentAllowances: EmployeeAllowance[];
  currentDeductions: EmployeeDeduction[];
  workLocationId: string | null;
  currency: string;
}
```

**Features:**
- Display and edit Basic Salary input field
- Display and edit GOSI Registered Salary (if employee is subject to GOSI)
- Display current allowances with ability to:
  - Add new allowances (using existing `AddAllowanceDialog`)
  - Remove allowances
  - Edit amounts for variable/custom allowances
- Display current deductions with ability to:
  - Add new deductions (using existing `AddDeductionDialog`)
  - Remove deductions
  - Edit amounts
- Show calculated totals (Gross Pay, Total Deductions, Net Pay) in real-time
- Optional "Reason for Change" text field
- Save button that:
  1. Updates employee salary and GOSI salary in `employees` table
  2. Updates allowances in `employee_allowances` table
  3. Updates deductions in `employee_deductions` table
  4. Creates a `salary_history` record with:
     - `change_type: 'compensation_update'`
     - `previous_salary` and `new_salary`
     - `previous_allowances` and `new_allowances` snapshots
     - `previous_deductions` and `new_deductions` snapshots
     - `reason` field

### 2. Create Custom Hook: `useUpdateCompensation.ts`

**Location:** `src/hooks/useUpdateCompensation.ts`

**Purpose:** Single mutation that atomically updates all compensation components and creates history record.

**Interface:**
```typescript
interface UpdateCompensationInput {
  employeeId: string;
  previousSalary: number;
  newSalary: number;
  previousGosiSalary: number | null;
  newGosiSalary: number | null;
  previousAllowances: CompensationComponent[];
  newAllowances: AllowanceInput[];
  previousDeductions: CompensationComponent[];
  newDeductions: DeductionInput[];
  reason?: string;
}
```

**Behavior:**
1. Update `employees` table with new `salary` and `gosi_registered_salary`
2. Delete existing employee_allowances, insert new ones
3. Delete existing employee_deductions, insert new ones
4. Create `salary_history` record with full snapshot
5. Invalidate relevant query keys:
   - `queryKeys.employees.detail(employeeId)`
   - `queryKeys.compensation.allowances.byEmployee(employeeId)`
   - `queryKeys.compensation.deductions.byEmployee(employeeId)`
   - `queryKeys.compensation.salaryHistory(employeeId)`

### 3. Update EmployeeProfile.tsx

**Changes:**
1. Import the new `EditSalaryDialog` component
2. Add state for dialog visibility: `const [editSalaryOpen, setEditSalaryOpen] = useState(false)`
3. Add "Edit Salary" button to the Compensation card header (next to the eye toggle)
4. Render `EditSalaryDialog` with required props

**Location of Edit Button:** Inside the Compensation card header (line 546-564), add a Pencil icon button that only shows for users with `canEditEmployees` permission.

---

## Component Structure

```
EmployeeProfile.tsx
├── Compensation Card
│   ├── Header
│   │   ├── Title + Icon
│   │   ├── [NEW] Edit Button (Pencil icon) - canEditEmployees only
│   │   └── Eye/EyeOff toggle
│   └── Content (blur-to-reveal)
│       └── Salary breakdown display
│
├── [NEW] EditSalaryDialog
│   ├── DialogHeader: "Edit Salary"
│   ├── DialogContent
│   │   ├── Basic Salary Input
│   │   ├── GOSI Registered Salary Input (if applicable)
│   │   ├── Allowances Section
│   │   │   ├── List of current allowances (editable amounts)
│   │   │   ├── Add Allowance button → AddAllowanceDialog
│   │   │   └── Remove buttons per allowance
│   │   ├── Deductions Section
│   │   │   ├── List of current deductions (editable amounts)
│   │   │   ├── Add Deduction button → AddDeductionDialog
│   │   │   └── Remove buttons per deduction
│   │   ├── Summary Section
│   │   │   ├── Gross Pay (Basic + Allowances)
│   │   │   ├── Total Deductions
│   │   │   └── Net Pay
│   │   └── Reason Input (optional)
│   └── DialogFooter
│       ├── Cancel button
│       └── Save Changes button
│
└── SalaryHistoryCard (existing - will show new record after save)
```

---

## Data Flow

```
User clicks "Edit Salary"
         │
         ▼
EditSalaryDialog opens
         │
    ┌────┴────┐
    │ Loads   │
    │ current │
    │ values  │
    └────┬────┘
         │
         ▼
User modifies:
• Basic Salary
• GOSI Salary
• Allowances (add/remove/edit)
• Deductions (add/remove/edit)
• Reason for change
         │
         ▼
User clicks "Save Changes"
         │
         ▼
useUpdateCompensation mutation:
1. Update employees table (salary, gosi_registered_salary)
2. Replace employee_allowances
3. Replace employee_deductions
4. Insert salary_history record with snapshots
         │
         ▼
Query invalidation:
• employees.detail
• compensation.allowances
• compensation.deductions
• compensation.salaryHistory
         │
         ▼
UI automatically refreshes:
• Compensation card shows new values
• Salary History card shows new record
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/employees/EditSalaryDialog.tsx` | Main dialog component for editing salary |
| `src/hooks/useUpdateCompensation.ts` | Mutation hook for atomic compensation updates |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/EmployeeProfile.tsx` | Add Edit button, dialog state, render EditSalaryDialog |
| `src/components/employees/index.ts` | Export EditSalaryDialog |

---

## Technical Details

### EditSalaryDialog Component

**State Management:**
```typescript
// Local state for form values
const [basicSalary, setBasicSalary] = useState(employee.salary || 0);
const [gosiSalary, setGosiSalary] = useState(employee.gosiRegisteredSalary || null);
const [allowances, setAllowances] = useState<LocalAllowance[]>([]);
const [deductions, setDeductions] = useState<LocalDeduction[]>([]);
const [reason, setReason] = useState('');
const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
const [showDeductionDialog, setShowDeductionDialog] = useState(false);
```

**Initialize from Props:**
```typescript
useEffect(() => {
  if (open) {
    setBasicSalary(employee.salary || 0);
    setGosiSalary(employee.gosiRegisteredSalary || null);
    setAllowances(mapToLocalAllowances(currentAllowances));
    setDeductions(mapToLocalDeductions(currentDeductions));
    setReason('');
  }
}, [open, employee, currentAllowances, currentDeductions]);
```

**Save Handler:**
```typescript
const handleSave = () => {
  updateCompensation.mutate({
    employeeId: employee.id,
    previousSalary: employee.salary || 0,
    newSalary: basicSalary,
    previousGosiSalary: employee.gosiRegisteredSalary || null,
    newGosiSalary: employee.isSubjectToGosi ? gosiSalary : null,
    previousAllowances: createAllowanceSnapshot(currentAllowances),
    newAllowances: allowances.map(a => ({
      templateId: a.templateId,
      customName: a.customName,
      customAmount: a.amount,
    })),
    previousDeductions: createDeductionSnapshot(currentDeductions),
    newDeductions: deductions.map(d => ({
      templateId: d.templateId,
      customName: d.customName,
      customAmount: d.amount,
    })),
    reason: reason || 'Compensation updated',
  }, {
    onSuccess: () => {
      toast({ title: "Compensation updated", description: "..." });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive", ... });
    },
  });
};
```

### useUpdateCompensation Hook

**Implementation Approach:**
```typescript
export function useUpdateCompensation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateCompensationInput) => {
      const { data: userData } = await supabase.auth.getUser();
      
      // 1. Update employee salary
      const { error: empError } = await supabase
        .from('employees')
        .update({
          salary: input.newSalary,
          gosi_registered_salary: input.newGosiSalary,
        })
        .eq('id', input.employeeId);
      if (empError) throw empError;
      
      // 2. Replace allowances
      await supabase.from('employee_allowances')
        .delete().eq('employee_id', input.employeeId);
      if (input.newAllowances.length > 0) {
        await supabase.from('employee_allowances')
          .insert(input.newAllowances.map(a => ({
            employee_id: input.employeeId,
            allowance_template_id: a.templateId || null,
            custom_name: a.customName || null,
            custom_amount: a.customAmount || null,
          })));
      }
      
      // 3. Replace deductions (similar pattern)
      // ...
      
      // 4. Create salary history record
      await supabase.from('salary_history').insert({
        employee_id: input.employeeId,
        previous_salary: input.previousSalary,
        new_salary: input.newSalary,
        change_type: 'compensation_update',
        reason: input.reason || null,
        effective_date: new Date().toISOString().split('T')[0],
        changed_by: userData?.user?.id || null,
        previous_allowances: input.previousAllowances,
        new_allowances: /* snapshot of new allowances */,
        previous_deductions: input.previousDeductions,
        new_deductions: /* snapshot of new deductions */,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.employees.detail(variables.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.compensation.allowances.byEmployee(variables.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.compensation.deductions.byEmployee(variables.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.compensation.salaryHistory(variables.employeeId) 
      });
    },
  });
}
```

---

## UI Design

The dialog will follow existing design patterns with:
- Consistent use of shadcn/ui components
- DGC brand colors (gold primary actions)
- Clear section headers for Allowances and Deductions
- Real-time calculated totals in a summary section
- Editable amount inputs for variable allowances and custom items
- Remove buttons (X icons) for each allowance/deduction
- "Add" buttons that open the existing template selection dialogs

---

## Permissions

The "Edit Salary" button will only be visible to users with `canEditEmployees` permission (HR/Admin roles), following the same pattern used for the Bank Details edit button.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create `useUpdateCompensation.ts` hook for atomic compensation updates |
| 2 | Create `EditSalaryDialog.tsx` component with full compensation editing UI |
| 3 | Export new component from `src/components/employees/index.ts` |
| 4 | Add Edit button and dialog to EmployeeProfile.tsx Compensation card |

This implementation reuses existing patterns and components (AddAllowanceDialog, AddDeductionDialog, existing snapshot helpers) while providing a cohesive editing experience for all compensation components.
