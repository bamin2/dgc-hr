
# Fix Leave Request Action Items in Time Off Page

## Problem
The action items dropdown menu in "Time Off → Leave and balances" tab has three menu items (View details, Edit, Cancel) but none of them have `onClick` handlers implemented. Clicking on any menu item does nothing.

## Root Cause
In `src/components/timeoff/LeavesBalancesTab.tsx` (lines 202-211), the `DropdownMenuItem` components are rendered without any functionality:

```tsx
<DropdownMenuItem>View details</DropdownMenuItem>
{entry.status === 'pending' && (
  <>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
  </>
)}
```

## Solution
Implement the three action items with appropriate functionality:

1. **View details**: Open a dialog showing the leave request details (employee info, dates, status, reason, approval progress)
2. **Edit**: Open the request editing dialog (only for pending requests) 
3. **Cancel**: Show a confirmation dialog, then delete the request using `useDeleteLeaveRequest` hook

## Implementation Steps

### Step 1: Create LeaveRequestDetailDialog Component

**File**: `src/components/timeoff/LeaveRequestDetailDialog.tsx` (new)

Create a dialog that shows:
- Leave type with color indicator
- Date range and duration
- Status badge
- Reason/note
- Submission date
- For non-pending: reviewed by and reviewed at info
- For rejected: rejection reason

### Step 2: Create EditLeaveRequestDialog Component

**File**: `src/components/timeoff/EditLeaveRequestDialog.tsx` (new)

Create a dialog similar to `RequestTimeOffDialog` but:
- Pre-populated with existing request data
- Uses `useUpdateLeaveRequest` hook to save changes
- Only allows editing pending requests

### Step 3: Update LeavesBalancesTab Component

**File**: `src/components/timeoff/LeavesBalancesTab.tsx`

Changes:
- Add state for selected request and dialog visibility
- Import hooks: `useDeleteLeaveRequest`
- Import dialogs: `LeaveRequestDetailDialog`, `EditLeaveRequestDialog`
- Import `AlertDialog` for cancel confirmation
- Add `onClick` handlers to all dropdown menu items
- Add dialog components at the end of the component

### Step 4: Update Exports

**File**: `src/components/timeoff/index.ts`

Export the new dialog components.

## Technical Details

### State Management in LeavesBalancesTab
```tsx
const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

const deleteRequest = useDeleteLeaveRequest();

const handleViewDetails = (request: LeaveRequest) => {
  setSelectedRequest(request);
  setIsDetailDialogOpen(true);
};

const handleEdit = (request: LeaveRequest) => {
  setSelectedRequest(request);
  setIsEditDialogOpen(true);
};

const handleCancelRequest = (request: LeaveRequest) => {
  setSelectedRequest(request);
  setIsCancelDialogOpen(true);
};

const confirmCancel = async () => {
  if (selectedRequest) {
    await deleteRequest.mutateAsync(selectedRequest.id);
    setIsCancelDialogOpen(false);
    setSelectedRequest(null);
  }
};
```

### Updated Dropdown Menu
```tsx
<DropdownMenuContent align="end">
  <DropdownMenuItem onClick={() => handleViewDetails(entry)}>
    <Eye className="w-4 h-4 mr-2" />
    View details
  </DropdownMenuItem>
  {entry.status === 'pending' && (
    <>
      <DropdownMenuItem onClick={() => handleEdit(entry)}>
        <Pencil className="w-4 h-4 mr-2" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem 
        className="text-destructive"
        onClick={() => handleCancelRequest(entry)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Cancel
      </DropdownMenuItem>
    </>
  )}
</DropdownMenuContent>
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/timeoff/LeaveRequestDetailDialog.tsx` | **Create** | Dialog to view leave request details |
| `src/components/timeoff/EditLeaveRequestDialog.tsx` | **Create** | Dialog to edit pending leave requests |
| `src/components/timeoff/LeavesBalancesTab.tsx` | **Update** | Add state, handlers, and wire up dropdown actions |
| `src/components/timeoff/index.ts` | **Update** | Export new dialog components |

## User Experience

**View Details Flow:**
1. User clicks three-dot menu on a leave request row
2. Clicks "View details"
3. Dialog opens showing all request information in read-only format
4. User can close the dialog

**Edit Flow:**
1. User clicks three-dot menu on a pending leave request
2. Clicks "Edit"
3. Dialog opens with pre-filled form (leave type, dates, note)
4. User makes changes and saves
5. Toast confirms update, dialog closes

**Cancel Flow:**
1. User clicks three-dot menu on a pending leave request
2. Clicks "Cancel" (destructive red text)
3. Confirmation dialog appears: "Are you sure you want to cancel this leave request?"
4. User confirms, request is deleted
5. Toast confirms deletion, table refreshes
