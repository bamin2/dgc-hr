## Problem

In My Profile, several tab sections render as a card that sits alone on its row, but they are declared with `colSpan={6}` on the 8-column Bento grid — which only fills 6/8 ≈ 75% of the available width. That's why the **Time Off** "Leave Balances (2026)" and "Leave History" cards (and similar cards on other tabs) look narrower than the **Compensation** tab cards (which correctly use `colSpan={12}` → mapped to full 8/8 width).

Compensation looks right because every standalone section uses `colSpan={12}` (the legacy full-width value).

## Fix

Change every `BentoCard` that is the only card on its row from `colSpan={6}` to `colSpan={12}` (full width). Cards that are paired side-by-side on the same row (e.g. Personal tab's Contact Info 8 + Personal Info 4) stay as-is.

### Files to edit

**`src/components/myprofile/MyProfileTimeOffTab.tsx`**
- Leave Balances card: `colSpan={6}` → `colSpan={12}`
- Leave History card: `colSpan={6}` → `colSpan={12}`
- Loading skeleton equivalents: same change

**`src/components/myprofile/MyProfileLoansTab.tsx`**
- Active loans section card: `colSpan={6}` → `colSpan={12}`
- Closed loans card: `colSpan={6}` → `colSpan={12}` when shown alone (the `pendingLoans.length > 0 ? 6 : 12` ternary already handles solo case correctly; only the always-`6` ones get widened)

**`src/components/myprofile/MyProfileBenefitsTab.tsx`**
- Same treatment: any solo-row `colSpan={6}` becomes `colSpan={12}`. Paired cards (loading skeletons that render in a row of two) stay `colSpan={6}`.

**`src/components/myprofile/MyProfileDocumentsTab.tsx`**
- HR Letters and Payslips render as a side-by-side pair (`6` + `6`). When both are present they should still pair up, but together they only fill 12/8 (full). No change needed unless one is empty — leave as-is.

**No changes** to: Compensation tab (already correct), Overview tab (intentional 2×2 grid of paired cards), Personal tab (already uses `8+4` pairs and `12` for solo Emergency Contact).

## Out of scope

- No logic, data, or flow changes
- No visual restyle beyond width
- BentoCard / BentoGrid component internals stay untouched
