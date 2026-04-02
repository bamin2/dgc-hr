
## Fix the employee dropdown scroll issue in the actual Add Leave Request dialog

### What I found
The active component is `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`.

The employee picker already has:
- manual filtering with `shouldFilter={false}`
- a scrollable `CommandGroup`

So the remaining problem is not the search logic. The likely issue is the interaction between:
- `Dialog` modal scroll locking
- a portalled `PopoverContent`
- nested `CommandList` / `CommandGroup` overflow containers

This is a common Radix pattern where mouse-wheel scrolling fails even though the list visually looks scrollable.

### Plan
1. Simplify the employee list to a single scroll container
   - Keep `CommandList` as the only scrollable region
   - Remove extra overflow handling from `CommandGroup`
   - Give the list a clear max height (for example `max-h-[280px]`)

2. Make the employee popover work correctly inside the dialog
   - Update the employee `Popover` to render in a dialog-friendly way so wheel/trackpad events are not blocked by the modal layer
   - Use the established Radix-safe approach for popovers inside dialogs rather than relying on the default portal behavior

3. Keep the current employee search behavior
   - Preserve `shouldFilter={false}`
   - Preserve local `empSearch` + `filteredEmps`
   - Do not change the employee query or selection logic

4. Tighten the popover container sizing
   - Ensure `PopoverContent` has a stable width and no conflicting overflow styles
   - Keep the search input fixed at the top and only the results area scrollable

5. Verify the same pattern against existing comboboxes
   - Align the final structure with the project’s other searchable pickers where possible
   - Only update shared primitives if needed; otherwise keep the fix scoped to this dialog

### Expected implementation outcome
- Employee list scrolls with mouse wheel and trackpad
- Scroll remains smooth inside the modal dialog
- Search still works
- No change to layout, fields, or submit behavior

### Files to update
- `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`
- Possibly `src/components/ui/popover.tsx` only if a scoped dialog-safe popover option is needed
