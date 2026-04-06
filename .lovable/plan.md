

# Fix Bulk Salary Update Wizard — 4 Issues

## 1. Make sidebar steps clickable

**File:** `src/components/team/wizard/VerticalWizardProgress.tsx`

Add an `onStepClick` callback prop. Make completed and current steps clickable (not future steps). Wrap step content in a `button` element for completed/current steps.

**File:** `src/components/team/wizard/bulk-salary/BulkSalaryUpdateWizard.tsx`

Pass `onStepClick` to `VerticalWizardProgress`. When a step is clicked, validate that it's a completed step (index < currentStepIndex) or current step, then call `setCurrentStep(effectiveSteps[clickedIndex].id)`. Also reset the compensation loaded ref if jumping back before step 3.

## 2. Allow backdated effective dates

**File:** `src/components/team/wizard/bulk-salary/steps/EffectiveDateStep.tsx`

- Remove the `disabled={(date) => date < today}` constraint from the calendar
- Replace the "cannot be backdated" alert with an informational note that says backdated changes will be recorded but may require retroactive payroll adjustments
- Add a warning alert when a past date is selected (amber/yellow) explaining the implications

## 3. Fix currency symbol overlap in compensation card inputs

**File:** `src/components/team/wizard/bulk-salary/components/EmployeeCompensationCard.tsx`

The currency symbol (e.g. "SAR") overlaps the input value because `pl-6` only accommodates short symbols like "$". Fix:
- For the allowance input (line 184): change `pl-6` to dynamically account for symbol length. Use `pl-10` for 3-char symbols or compute based on `currencySymbol.length`
- For the deduction input (line 246): same fix
- For the header totals (lines 129, 132): add a space between symbol and amount
- A simple approach: use `pl-12` universally to fit any symbol (SAR, AED, BHD, etc.) and adjust the symbol `left` position slightly

## 4. Fix Review step showing wrong currency for mixed-currency selections

**File:** `src/components/team/wizard/bulk-salary/BulkSalaryUpdateWizard.tsx`

The `currency` is derived from the first employee only (line 59-67). This single currency is passed to `ReviewSummaryStep` which uses `Intl.NumberFormat` with that one currency for ALL employees.

**Fix approach:** Instead of passing a single currency, the Review step needs per-employee currency awareness.

**File:** `src/components/team/wizard/bulk-salary/steps/ReviewSummaryStep.tsx`

- Add per-employee currency from the `EmployeeImpact` — extend the `EmployeeImpact` interface in `types.ts` to include `currency: string`
- In the per-employee breakdown, format each employee's amounts with their own currency
- For the totals section: if mixed currencies exist, either show totals grouped by currency or show a warning that totals are approximate across currencies

**File:** `src/components/team/wizard/bulk-salary/types.ts`

- Add `currency: string` to `EmployeeImpact` interface

**File:** `src/hooks/useBulkSalaryWizard.ts`

- In `calculateEmployeeImpacts`, include `currency: employee.currency || 'BHD'` in each impact object

## Technical Summary

| Issue | Files | Change |
|-------|-------|--------|
| Clickable sidebar steps | `VerticalWizardProgress.tsx`, `BulkSalaryUpdateWizard.tsx` | Add `onStepClick` prop, handle navigation |
| Backdated dates | `EffectiveDateStep.tsx` | Remove date restriction, add warning for past dates |
| Currency symbol overlap | `EmployeeCompensationCard.tsx` | Increase input padding from `pl-6` to `pl-12` |
| Mixed currency in Review | `types.ts`, `useBulkSalaryWizard.ts`, `ReviewSummaryStep.tsx` | Per-employee currency formatting |

