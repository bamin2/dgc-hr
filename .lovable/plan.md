

# Simplify Mobile Payslip Actions to Single "Download" Button

## Problem
Each payslip in the mobile sheet shows two buttons: "View" (opens PDF in new tab -- doesn't work well on mobile) and "Download" (triggers a file download). On mobile, "View" effectively does nothing useful since mobile browsers handle PDFs inconsistently. Only one action is needed.

## Solution
Remove the "View" button entirely. Keep only the "Download" button, but make it the primary action styled as a full-width button (not outline). Remove the `handleView` function and related `Eye` icon import since they're no longer needed.

## File to modify

**`src/components/myprofile/mobile/MobilePayslipsSheet.tsx`**
- Remove `handleView` function (lines 60-76)
- Remove `Eye` from icon imports
- Replace the two-button row (lines 159-193) with a single full-width "Download" button
- Clean up `loadingId` logic (no longer need the view-specific check)

