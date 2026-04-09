

# Fix HR Letter View and Payslip Display Issues

## Problem 1: HR Letter — "Nothing happens" when clicking View
The `handleView` function calls `window.open(signedUrl, '_blank')` from inside an async `mutateAsync` callback. Browsers block popups that aren't triggered by a direct user gesture. The signed URL is generated successfully (confirmed in network logs), but the popup is silently blocked.

## Problem 2: Payslip — iframe shows blank
The `PayslipPdfViewer` embeds the signed PDF URL in an iframe. The signed URL is generated successfully, but the PDF does not render inside the iframe (cross-origin restrictions in the preview environment). Meanwhile, the `PayslipCard` fallback (which renders the payslip data as a styled card) is skipped because the code prioritizes the PDF viewer when a `payslip_documents` record exists.

## Fixes

### 1. HR Letter View — use link click instead of window.open
**File:** `src/components/myprofile/MyProfileHRLettersSection.tsx`

Change `handleView` to create a temporary `<a>` element with `target="_blank"` and click it programmatically, similar to the download pattern already in the code. This avoids popup blocker issues. Also add a loading state to the view button so users see feedback while the URL is being generated.

### 2. Payslip — show PayslipCard as primary, PDF as secondary action
**File:** `src/pages/MyPayslip.tsx`

Change the rendering logic: always show `PayslipCard` when payslip data is available (it always works). If a PDF document exists, show "View PDF" and "Download PDF" buttons that open/download the PDF, rather than embedding an iframe that may not work.

### 3. PayslipPdfViewer — add error detection fallback
**File:** `src/components/payroll/PayslipPdfViewer.tsx`

Add an `onError` handler to the iframe and a timeout-based fallback. If the iframe fails to load, show action buttons (Open in New Tab / Download) instead of a blank iframe.

## Files to modify

| File | Change |
|------|--------|
| `src/components/myprofile/MyProfileHRLettersSection.tsx` | Use `<a>` click pattern instead of `window.open`; add loading state |
| `src/pages/MyPayslip.tsx` | Show `PayslipCard` as primary view; add PDF download/open buttons when PDF exists |
| `src/components/payroll/PayslipPdfViewer.tsx` | Add iframe error detection with fallback to action buttons |

