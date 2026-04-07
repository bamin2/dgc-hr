

# Leave Request Attachments — Drag & Drop Upload with Mandatory Flag

## Overview
Add file attachment support to leave request dialogs (both employee and admin) with drag-and-drop upload, and allow admins to mark attachments as mandatory per leave type.

## Database Changes

### 1. New `leave_request_attachments` table
Stores files uploaded with a leave request. One request can have multiple attachments.

```sql
CREATE TABLE public.leave_request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

RLS policies: HR/admin full access, employees can read/insert their own request attachments.

### 2. New column on `leave_types`: `attachment_required`
Boolean flag (default false). When true, the leave request form will require at least one attachment before submission.

```sql
ALTER TABLE public.leave_types ADD COLUMN attachment_required BOOLEAN DEFAULT false;
```

### 3. New storage bucket: `leave-attachments`
Private bucket for leave request attachment files.

## Frontend Changes

### 1. Create reusable `FileDropzone` component
**File:** `src/components/ui/file-dropzone.tsx`

A drag-and-drop file upload area with:
- Visual drag-over state
- File list with remove button
- Max file size validation (20MB)
- Accepts common document/image types

### 2. Create `useLeaveAttachments` hook
**File:** `src/hooks/useLeaveAttachments.ts`

- `uploadAttachments(leaveRequestId, files[])` — uploads to storage bucket, inserts rows into `leave_request_attachments`
- `useLeaveRequestAttachments(leaveRequestId)` — fetches attachments for viewing

### 3. Update `RequestTimeOffDialog.tsx` (employee dialog)
- Replace the existing placeholder drag-and-drop area (lines 386-404) with the real `FileDropzone`
- Track selected files in state
- After creating the leave request, upload files using the hook
- If the selected leave type has `attachment_required: true`, block submission without files and show a validation message

### 4. Update `AdminAddLeaveRequestDialog.tsx`
- Add the same `FileDropzone` between the reason field and the footer
- Same attachment upload flow after insert
- Respect `attachment_required` from the selected leave type

### 5. Update `LeaveTypeFormDialog.tsx` (leave type policy editor)
- Add a toggle: "Require Attachment" in the Document Requirements section (near the existing `requires_document` toggle)
- Persists `attachment_required` on save

### 6. Update `LeaveTypeCard.tsx`
- Show a badge when `attachment_required` is true

### 7. Update `LeaveRequestDetailView` / detail page
- Display uploaded attachments as downloadable links

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | New table, column, bucket, RLS policies |
| `src/components/ui/file-dropzone.tsx` | New reusable drag-and-drop component |
| `src/hooks/useLeaveAttachments.ts` | New hook for upload/fetch |
| `src/hooks/useLeaveTypes.ts` | Add `attachment_required` to `LeaveType` interface |
| `src/types/leave.ts` | Add `attachment_required` field |
| `src/components/timeoff/RequestTimeOffDialog.tsx` | Replace placeholder with real upload, enforce mandatory |
| `src/components/timemanagement/AdminAddLeaveRequestDialog.tsx` | Add file upload area |
| `src/components/timemanagement/LeaveTypeFormDialog.tsx` | Add "Require Attachment" toggle |
| `src/components/timemanagement/LeaveTypeCard.tsx` | Show badge for attachment-required types |
| `src/components/attendance/LeaveRequestDetailView.tsx` | Display attachments |

