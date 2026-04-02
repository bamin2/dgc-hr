
## Fix employee dropdown scrolling in the actual dialog in use

### What I found
The active component is `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`, used by `src/components/timemanagement/LeavesTab.tsx`.

The employee list still feels non-scrollable because the scroll constraint is applied to `CommandList`, while the actual item wrapper is `CommandGroup`. In this codebase, the working pattern used elsewhere is:

- `CommandList` as the outer list
- `CommandGroup className="max-h-[300px] overflow-y-auto"` as the scrollable region

Right now this dialog uses:
- `CommandList className="max-h-[200px] overflow-y-auto"`
- plain `CommandGroup`

That mismatch is likely why the list still doesn’t scroll reliably inside the nested Popover/Dialog setup.

### Plan
1. Update the employee picker in `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`
   - Remove the height/overflow classes from `CommandList`
   - Move the scroll behavior to `CommandGroup`
   - Use the same working pattern already used in `ApprovalSettingsTab`

2. Improve the scroll container behavior
   - Give `CommandGroup` a fixed max height such as `max-h-[240px]` or `max-h-[300px]`
   - Add `overflow-y-auto`
   - Optionally add a little right padding so the scrollbar does not crowd the content

3. Keep the current search behavior intact
   - Preserve `shouldFilter={false}`
   - Preserve manual `empSearch` filtering
   - Do not change the fetch/query logic since that issue is already fixed

4. Keep the popover compact and stable
   - Leave `PopoverContent` width behavior as-is
   - Avoid changing layout outside the employee dropdown

### Exact change shape
Current structure:
```tsx
<Command shouldFilter={false}>
  <CommandInput ... />
  <CommandList className="max-h-[200px] overflow-y-auto">
    <CommandEmpty ... />
    <CommandGroup>
      ...
    </CommandGroup>
  </CommandList>
</Command>
```

Planned structure:
```tsx
<Command shouldFilter={false}>
  <CommandInput ... />
  <CommandList>
    <CommandEmpty ... />
    <CommandGroup className="max-h-[240px] overflow-y-auto">
      ...
    </CommandGroup>
  </CommandList>
</Command>
```

### Expected result
- Mouse wheel scrolling works inside the employee dropdown
- Trackpad/touchpad scrolling works
- The list remains searchable
- The dropdown stays compact and usable even with many employees

### Technical details
Files to update:
- `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx`

Pattern reference already in codebase:
- `src/components/settings/approvals/ApprovalSettingsTab.tsx`

If needed during implementation, I would also add `overscroll-contain` to the scrollable group to prevent scroll chaining into the dialog, but only if the first fix alone does not fully solve it.
