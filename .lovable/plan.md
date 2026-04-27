## Problem

Ahmed Aljaber's photo file is in storage (`avatars/17d39cc1.../1777290451489.jpg`) but `employees.avatar_url` is empty. The Edit Employee form uploads the cropped image immediately, then only stores the URL in local form state — it isn't persisted to the database until the user clicks "Save Changes". If the dialog is closed without saving (or any later validation fails), the avatar is lost even though the file is uploaded.

## Plan

### 1. Persist avatar immediately on upload (fix)

In `src/components/employees/EmployeeForm.tsx`, after a successful crop + `uploadAvatar()` for an **existing** employee, immediately call the update mutation to write `avatar_url` to the database. This ensures the photo is saved the moment the upload completes — independent of the rest of the form.

- Use `useUpdateEmployeeMutation` directly inside the form (or a small `onAvatarUploaded(url)` prop) so we don't depend on the user clicking Save.
- For brand-new employees (no `employee.id` yet), keep current behavior: store in local state and persist on form submit.
- Show success toast only after the DB row is updated.
- Invalidate employee queries so the avatar appears across the table, profile pages, etc.

### 2. Backfill Ahmed Aljaber

Run a one-time update setting his `avatar_url` to the public URL of the existing storage object so his existing upload becomes visible.

### 3. Drag-and-drop avatar upload

Replace the current avatar block in `EmployeeForm.tsx` with a small dropzone that wraps the avatar:

- Visual: the round avatar stays as-is. A dashed ring + "Drag photo here or click to browse" hint appears on hover or when dragging.
- Behavior: 
  - `onDragOver` highlights the drop area (DGC gold ring).
  - `onDrop` reads the first image file, runs the same validation (image type, ≤5MB) and opens the existing `ImageCropper`.
  - Click still opens the file picker (existing behavior preserved).
- Reuse the existing `handlePhotoSelect` validation logic by extracting it into `processFile(file: File)` so both drop and click paths share it.
- No new dependencies; native HTML5 drag-and-drop, consistent with `src/components/ui/file-dropzone.tsx` patterns.

### 4. Apply the same dropzone to the Settings avatar (optional, recommended)

`src/components/settings/ImageUpload.tsx` is used for the company logo and similar uploads. Add the same drag-and-drop affordance there for consistency, since it's the shared image upload primitive. Behavior unchanged — just an additional drop target around the avatar preview.

## Technical Notes

- Files touched:
  - `src/components/employees/EmployeeForm.tsx` — auto-save on upload, drag-and-drop wrapper.
  - `src/components/settings/ImageUpload.tsx` — drag-and-drop affordance.
  - One SQL update to backfill Ahmed's `avatar_url`.
- No schema changes, no new packages.
- Storage RLS already allows authenticated uploads and public reads on the `avatars` bucket — verified.
- Drag-and-drop uses native events; matches the existing pattern in `file-dropzone.tsx`.
