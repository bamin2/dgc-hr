
Root cause is now clear from the actual code and network logs:

- The employee picker is not empty because of cmdk filtering anymore.
- It is empty because the employee fetch itself is failing.
- `AdminAddLeaveRequestDialog` currently queries:
  `department:departments(name)`
- In this schema, `employees` and `departments` have more than one relationship, so Supabase returns:
  `PGRST201 Could not embed because more than one relationship was found`
- Because that query errors, `employees` becomes empty and the popover shows `No employee found`.

Plan

1. Fix the employee query in `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`
- Change the select to use the explicit relationship:
  `department:departments!employees_department_id_fkey(name)`
- Keep the rest of the active employee filtering and ordering the same.

2. Keep the manual employee search approach
- Preserve `shouldFilter={false}` on `Command`
- Preserve local `empSearch` + `filteredEmps`
- This avoids the nested Dialog/Popover/cmdk filtering issue already identified.

3. Clean up the employee combobox trigger structure
- Remove the extra `FormControl` wrapper around the `Button` inside `PopoverTrigger asChild`
- The console warning shows a ref issue coming from that composition
- Replace it with a structure that still keeps accessibility/message wiring but does not pass a ref into a non-forwardRef wrapper chain incorrectly

4. Add basic loading/error UX for the employee list
- While `loadingEmployees`, show a lightweight loading state in the popover instead of “No employee found”
- If the employee query errors, show a clear message like “Failed to load employees”
- Only show “No employee found” when data loaded successfully and the filtered list is truly empty

5. Verify against existing project patterns
- Match the explicit FK relation style already used elsewhere in the codebase for employees + departments
- Keep all date pickers and the rest of the dialog behavior unchanged

Technical details

Files to update:
- `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`

Exact issue confirmed:
```text
GET /employees?select=id,first_name,last_name,avatar_url,department:departments(name)...
Status: 300
PGRST201: more than one relationship found for employees and departments
Hint: use departments!employees_department_id_fkey
```

Expected implementation outcome:
- Employee list loads correctly
- Search works
- “No employee found” only appears for real empty search results
- Ref warning is removed or reduced from the combobox trigger composition
