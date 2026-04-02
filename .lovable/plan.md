

# Fix Employee Selector in Add Leave Request Dialog

## Problem
The employee dropdown in `AdminAddLeaveRequestDialog` shows no employees. The database has data and RLS policies are correct. The issue is a **UI conflict**: Radix `Select` has built-in typeahead filtering that interferes with the embedded search `Input`. Radix internally hides items that don't match its own typeahead buffer, making all items invisible.

## Solution
Replace the Radix `Select` with a `Popover` + `Command` (cmdk) pattern for the employee picker. This is the standard shadcn approach for searchable selects and is already used elsewhere in the project (e.g., `command.tsx` exists).

## Changes

### File: `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`

**1. Update imports**
- Remove `Select, SelectContent, SelectItem, SelectTrigger, SelectValue`
- Remove `Search`, `Input` (no longer needed for custom search)
- Add `Popover, PopoverContent, PopoverTrigger` and `Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem`
- Add `Check` icon from lucide for selected state

**2. Replace employee `Select` block (lines 168-216) with Popover + Command**
- `Popover` wrapping a `Button` trigger that shows selected employee name or "Select employee..."
- `PopoverContent` containing `Command` with `CommandInput` for search
- `CommandList` with `CommandGroup` mapping over employees
- `CommandItem` for each employee with avatar, name, department
- On select: call `field.onChange(empId)` and close popover

**3. Remove `employeeSearch` state** — `Command` handles search internally via cmdk

**4. Remove `filteredEmployees` useMemo** — cmdk handles filtering internally

This matches the proven pattern used in other searchable selects across the app and eliminates the Radix Select typeahead conflict entirely.

