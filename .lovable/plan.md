

# Fix Empty Employee List in Add Leave Request Dialog

## Root Cause
The `Command` (cmdk) component inside a `Popover` inside a `Dialog` has a known interaction issue. The cmdk filter function may not properly match items when nested in this configuration, causing all `CommandItem`s to be filtered out and showing "No employee found."

## Fix
In `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`, add `shouldFilter={false}` to the `Command` component. This disables cmdk's internal filtering (which is misbehaving in this nested context) and lets all employees render. Since the `CommandInput` still works for user typing, we can optionally add manual filtering on the employee list, but for a reasonable-sized employee list (~50-100), showing all is fine.

### Change (line 196)
```tsx
// Before
<Command>

// After  
<Command shouldFilter={false}>
```

This is a single-line fix. The `CommandInput` will still be visible for UX but won't filter (all employees always shown). If manual filtering is desired, we add a local search state and filter `employees` before mapping.

### Optional Enhancement
If we want search to still work, add a `search` state and filter manually:
```tsx
const [empSearch, setEmpSearch] = useState('');
const filteredEmps = employees?.filter(e => 
  `${e.first_name} ${e.last_name}`.toLowerCase().includes(empSearch.toLowerCase())
);

<Command shouldFilter={false}>
  <CommandInput value={empSearch} onValueChange={setEmpSearch} />
  <CommandList>
    <CommandEmpty>No employee found.</CommandEmpty>
    <CommandGroup>
      {filteredEmps?.map(...)}
    </CommandGroup>
  </CommandList>
</Command>
```

One file changed: `AdminAddLeaveRequestDialog.tsx`

