

# Fix Dialog & Sheet Alignment Issues Across Loan Components

## Problem Identified
The `LoanDetailSheet` has a structural conflict: `SheetContent` wraps children in `<div class="flex flex-col h-full overflow-hidden">`, but the component puts `overflow-y-auto` on `SheetContent` itself and dumps all content into a raw `<div class="mt-6 space-y-6">` without using the `SheetBody` layout primitive. This causes:
- Scroll behavior conflicts (overflow-hidden vs overflow-y-auto)
- Content not properly contained within the sheet's flex layout
- No proper padding structure (content uses inline padding inconsistently)

## Changes

### 1. Fix `LoanDetailSheet.tsx` — use proper Sheet layout primitives
- Remove `overflow-y-auto` from `SheetContent` className
- Wrap the main content in `SheetBody` (provides `flex-1 overflow-y-auto px-6`)
- Remove `mt-6` from the content wrapper (SheetHeader already has `p-6` bottom padding)
- Keep `space-y-6` for internal spacing
- Move the sub-dialogs (Delete, Payment, Restructure, Skip, Approval) outside the `Sheet` component entirely — they are currently siblings of `SheetContent` inside `Sheet`, which is correct, but ensure they render properly

### 2. Fix other Sheet-based components with the same pattern
- `ProjectDetailSheet.tsx` — same issue: `overflow-y-auto` on `SheetContent`, raw div content
- `EventDetailSheet.tsx` — check and fix if same pattern
- `CandidatesList.tsx` sheets — same `overflow-y-auto` on `SheetContent`

### 3. Audit Dialog components for alignment
The following loan dialogs use `DialogContent` correctly but have minor inconsistencies:
- `CreateLoanDialog` — uses `size="xl"` with `max-h-[85vh] overflow-y-auto`, structure is fine
- `LoanApprovalDialog` — uses `size="lg"`, content directly inside `DialogContent`, no body wrapper needed (short content)
- `AdHocPaymentDialog` — uses `size="md"`, structure is fine
- `RestructureLoanDialog` — uses `size="lg"`, structure is fine
- `DeleteLoanDialog` — AlertDialog, structure is fine
- `SkipInstallmentDialog` — Dialog, structure is fine
- `EmployeeRequestLoanDialog` — uses `size="lg"` with `max-h-[90vh] overflow-y-auto`, structure is fine

No major issues in the Dialog-based components. The primary fix is the Sheet components.

## Technical Details

### File: `src/components/loans/LoanDetailSheet.tsx`
- Import `SheetBody` from `@/components/ui/sheet`
- Change `SheetContent className="w-full sm:max-w-xl overflow-y-auto"` → `SheetContent className="w-full sm:max-w-xl"`
- Wrap lines 105-289 (the `<div className="mt-6 space-y-6">...</div>`) in `<SheetBody>` and change inner div to `<div className="space-y-6 pb-6">`
- Also wrap the loading spinner in `<SheetBody>`

### File: `src/components/projects/ProjectDetailSheet.tsx`
- Same pattern: import `SheetBody`, remove `overflow-y-auto` from `SheetContent`, wrap content in `SheetBody`

### File: `src/components/calendar/EventDetailSheet.tsx`
- Same fix if applicable

### File: `src/components/hiring/candidates/CandidatesList.tsx`
- Fix the 3 sheet instances that use `overflow-y-auto` on `SheetContent`

## Impact
- Proper scrolling in all sheet panels
- Consistent padding and alignment
- No visual overflow or clipping issues
- Header stays fixed at top while body scrolls

