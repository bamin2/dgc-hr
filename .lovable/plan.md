## Bug

When the image cropper opens (after dragging a photo onto the avatar dropzone), every interaction inside the cropper — zoom slider, drag-to-reposition, button clicks — also triggers the dropzone's `onClick`, which opens the OS file picker.

## Cause

In `EmployeeForm.tsx`, the `<ImageCropper>` is rendered **inside** the dropzone `<div>` that has `onClick={() => fileInputRef.current?.click()}`. Even though the cropper uses a Radix Dialog (portaled to `document.body`), React's synthetic event system still bubbles events through the React tree to the dropzone, re-opening the file picker.

## Fix

1. Move the `<ImageCropper>` render **outside** the dropzone div (sibling, not child) in `src/components/employees/EmployeeForm.tsx`. This is the root cause and the fix is one structural move.
2. As a small hardening, keep `e.stopPropagation()` on the inner "Upload Photo" button (already there) so it doesn't double-trigger the dropzone click.

No other files need changes. The drag-and-drop, immediate persistence, and avatar display all keep working.
