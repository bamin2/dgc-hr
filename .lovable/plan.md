

# Dynamic Conditional Sections in Payslip Templates

## Problem
The DOCX payslip template always renders all fields (like Social Insurance / GOSI deduction) even when they don't apply to the employee. Nicy Daijo is not subject to GOSI, but her payslip shows "Social Insurance: BHD 0.00".

## Solution
Docxtemplater already supports conditional sections using `{#FLAG}...{/FLAG}` syntax. We need to:

1. **Pass boolean flags** as tag data during generation so the template can conditionally show/hide sections
2. **Fetch `is_subject_to_gosi`** from the employee record (it's not currently selected)
3. **Update the Smart Tags reference** so template authors know which conditional flags are available

### How it works for template authors
In the DOCX template, wrap conditional content like this:
```
{{#SHOW_GOSI}}
Social Insurance    {{GOSI_DEDUCTION}}
{{/SHOW_GOSI}}
```
If the employee is not subject to GOSI, the entire block (including the row) is removed from the output.

## Changes

### 1. Edge Function: `supabase/functions/generate-payslips/index.ts`
- Add `is_subject_to_gosi` to the employee SELECT query (line ~393)
- Add conditional boolean flags to `tagData`:
  - `SHOW_GOSI` — true when employee is subject to GOSI and deduction > 0
  - `SHOW_HOUSING_ALLOWANCE` — true when housing allowance > 0
  - `SHOW_TRANSPORT_ALLOWANCE` — true when transport allowance > 0
  - `SHOW_OTHER_ALLOWANCES` — true when other allowances > 0
  - `SHOW_OTHER_DEDUCTIONS` — true when other deductions > 0
  - `SHOW_LOAN_DEDUCTION` — true when loan deduction > 0

### 2. Edge Function: `supabase/functions/preview-payslip-template/index.ts`
- Same changes as above for the preview function so template authors can test conditional sections

### 3. Smart Tags Tab: `src/components/payroll/templates/SmartTagsTab.tsx`
- Add a new "Conditional Sections" category documenting available `SHOW_*` flags with usage instructions

### 4. Smart Tags reference: `src/utils/payslipTemplateGenerator.ts`
- Add `SHOW_*` flags to the `PAYSLIP_SMART_TAGS` array

## Technical Detail

Docxtemplater's `paragraphLoop: true` (already enabled) means `{#SHOW_GOSI}...{/SHOW_GOSI}` will remove entire paragraphs/rows when the flag is falsy. The tag data passes `true`/`false` — docxtemplater treats falsy values as "hide section".

The `angularParser` currently returns `scope[tag] ?? ""` which would return `""` (falsy) for missing flags, so existing templates without conditional sections continue to work unchanged.

## Files to modify

| File | Change |
|------|--------|
| `supabase/functions/generate-payslips/index.ts` | Fetch `is_subject_to_gosi`, add `SHOW_*` boolean flags to tagData |
| `supabase/functions/preview-payslip-template/index.ts` | Same conditional flags for preview |
| `src/components/payroll/templates/SmartTagsTab.tsx` | Add "Conditional" category with `SHOW_*` tags and usage instructions |
| `src/utils/payslipTemplateGenerator.ts` | Add `SHOW_*` entries to `PAYSLIP_SMART_TAGS` |

