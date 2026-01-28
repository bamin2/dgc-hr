
# Add Effective Date to Edit Salary Dialog

## Overview
Add an effective date picker to the Edit Salary dialog that determines when salary changes take effect for payroll calculations. When the effective date is in the future, the salary change will be scheduled rather than applied immediately.

## Current Behavior
- Salary changes are applied immediately to the `employees` table
- The `salary_history` table has an `effective_date` column but it's always set to today
- Payroll reads the current salary from the `employees` table, ignoring historical effective dates

## Proposed Behavior
1. **Immediate changes** (effective date = today): Works as it does now - salary updated immediately
2. **Future changes** (effective date > today): 
   - Record the change in `salary_history` with the future effective date
   - Do NOT update the `employees` table salary yet
   - When payroll runs, check if there are pending salary changes effective within the pay period

## Implementation Steps

### Step 1: Update EditSalaryDialog UI

**File: `src/components/employees/EditSalaryDialog.tsx`**

Add an effective date field using Popover + Calendar pattern (per custom knowledge):

```tsx
// Add state
const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());

// Add to form, after Basic Salary field
<div className="space-y-1.5">
  <Label>Effective Date</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-start text-left">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {format(effectiveDate, 'MMMM d, yyyy')}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={effectiveDate}
        onSelect={(date) => date && setEffectiveDate(date)}
        disabled={(date) => date < today}
        className="pointer-events-auto"
      />
    </PopoverContent>
  </Popover>
  <p className="text-xs text-muted-foreground">
    The date when this salary will take effect for payroll
  </p>
</div>
```

Add visual indicator when scheduling future change:
```tsx
{effectiveDate > today && (
  <Alert className="border-amber-200 bg-amber-50">
    <Clock className="h-4 w-4 text-amber-600" />
    <AlertDescription className="text-amber-800">
      This salary change is scheduled for {format(effectiveDate, 'MMMM d, yyyy')}.
      The current salary will remain in effect until then.
    </AlertDescription>
  </Alert>
)}
```

### Step 2: Update useUpdateCompensation Hook

**File: `src/hooks/useUpdateCompensation.ts`**

Modify the interface and mutation logic:

```tsx
export interface UpdateCompensationInput {
  // ... existing fields
  effectiveDate: Date; // NEW: Add effective date
}

// In mutationFn:
const isImmediate = input.effectiveDate.toDateString() === new Date().toDateString();

if (isImmediate) {
  // Apply changes immediately (existing behavior)
  await supabase.from('employees').update({
    salary: input.newSalary,
    gosi_registered_salary: input.newGosiSalary,
  }).eq('id', input.employeeId);
  
  // Also update allowances/deductions immediately
  // ... existing logic
}

// Always create salary history record with the specified effective date
await supabase.from('salary_history').insert({
  employee_id: input.employeeId,
  previous_salary: input.previousSalary,
  new_salary: input.newSalary,
  change_type: isImmediate ? 'compensation_update' : 'scheduled_update',
  reason: input.reason || 'Compensation updated',
  effective_date: format(input.effectiveDate, 'yyyy-MM-dd'),
  changed_by: userData?.user?.id || null,
  // ... allowance/deduction snapshots
});
```

### Step 3: Create Pending Salary Changes Table (Database)

We need a table to store pending salary changes that haven't been applied yet. This is cleaner than storing pending data in `salary_history` alone.

```sql
CREATE TABLE public.pending_salary_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  salary_history_id UUID REFERENCES salary_history(id) ON DELETE CASCADE,
  new_salary NUMERIC NOT NULL,
  new_gosi_salary NUMERIC,
  new_allowances JSONB,
  new_deductions JSONB,
  effective_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  applied_at TIMESTAMPTZ,
  UNIQUE (employee_id, effective_date)
);

-- Enable RLS
ALTER TABLE public.pending_salary_changes ENABLE ROW LEVEL SECURITY;

-- HR/Admin can manage pending changes
CREATE POLICY "hr_admin_manage_pending_changes" ON public.pending_salary_changes
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));
```

### Step 4: Update Payroll to Check Pending Changes

**File: `src/hooks/usePayrollRunEmployees.ts`**

In the `snapshotEmployees` function, check for pending salary changes that are effective on or before the payroll run's end date:

```tsx
// After fetching employees, check for pending salary changes
const { data: pendingChanges } = await supabase
  .from('pending_salary_changes')
  .select('*')
  .in('employee_id', employeeIds)
  .eq('status', 'pending')
  .lte('effective_date', payPeriodEnd); // Effective on or before pay period end

// Apply pending changes to the snapshot
const pendingByEmployee = new Map(
  (pendingChanges || []).map(p => [p.employee_id, p])
);

// When building snapshot, use pending salary if exists
const baseSalary = pendingByEmployee.get(emp.id)?.new_salary ?? emp.salary ?? 0;
```

### Step 5: Apply Pending Changes via Background Process

When a pending change's effective date arrives, we need to apply it. This can be:
- A scheduled edge function that runs daily
- Applied during payroll snapshot creation

For simplicity, we'll apply during payroll run:

```tsx
// When snapshotting, also apply pending changes that have reached their effective date
const changesToApply = (pendingChanges || []).filter(
  p => new Date(p.effective_date) <= new Date()
);

for (const change of changesToApply) {
  // Update employee record
  await supabase.from('employees').update({
    salary: change.new_salary,
    gosi_registered_salary: change.new_gosi_salary,
  }).eq('id', change.employee_id);
  
  // Mark as applied
  await supabase.from('pending_salary_changes').update({
    status: 'applied',
    applied_at: new Date().toISOString()
  }).eq('id', change.id);
}
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/employees/EditSalaryDialog.tsx` | Update | Add effective date picker with Popover + Calendar |
| `src/hooks/useUpdateCompensation.ts` | Update | Add effective date to input, handle immediate vs scheduled |
| `src/hooks/usePayrollRunEmployees.ts` | Update | Check and apply pending salary changes during snapshot |
| Database Migration | Create | Add `pending_salary_changes` table |

## UI Preview

```text
┌─────────────────────────────────────────────────────────┐
│                     Edit Salary                         │
│─────────────────────────────────────────────────────────│
│                                                         │
│  Basic Salary                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 15,000                                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Effective Date                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📅 February 1, 2026                             │   │
│  └─────────────────────────────────────────────────┘   │
│  The date when this salary will take effect for payroll │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ⏰ This salary change is scheduled for            │ │
│  │    February 1, 2026. The current salary will      │ │
│  │    remain in effect until then.                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Allowances                                   [+ Add]   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Housing Allowance                        2,500  │   │
│  │ Transportation                           1,000  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                              [Cancel]  [Save Changes]   │
└─────────────────────────────────────────────────────────┘
```

## Technical Notes

1. **Calendar Component**: Using standard Shadcn `Calendar` wrapped in `Popover` per custom knowledge requirements
2. **Minimum Date**: Cannot select dates before today (no backdating)
3. **Payroll Integration**: Pending changes are checked during payroll snapshot creation
4. **Atomicity**: When applying pending changes, we update both the employee record and mark the change as applied
5. **History**: All changes (immediate and scheduled) are recorded in `salary_history` for audit trail

## Edge Cases Handled

- **Multiple pending changes**: Only the most recent pending change for an employee is applied
- **Cancelled changes**: User can cancel a scheduled change before it takes effect (future enhancement)
- **Payroll across effective date**: If pay period spans the effective date, the new salary is used for the entire period (standard approach)
