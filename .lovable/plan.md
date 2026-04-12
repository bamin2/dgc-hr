

# Fix Payslip Filenames and Add ZIP Download

## Problem
1. Downloaded payslip filenames use a random/unclear format instead of the requested convention
2. "Download All" triggers individual file downloads instead of a single ZIP

## Solution

### 1. Filename format
Change all payslip filenames to:
```
{EmployeeCode}_{FirstName}_{LastName}_Salary_Slip_{Month}_{Year}.pdf
```
Example: `EMP-0001_John_Smith_Salary_Slip_March_2025.pdf`

### 2. ZIP download for "Download All"
Install `jszip` and bundle all payslip PDFs into a single ZIP file.
ZIP filename: `Payslips_{Month}_{Year}.zip` (e.g. `Payslips_March_2025.zip`)

## Files to modify

| File | Change |
|------|--------|
| `package.json` | Add `jszip` dependency |
| `src/hooks/usePayslipDocuments.ts` | Add `getPayslipBlob` helper that fetches a payslip PDF as a Blob via signed URL |
| `src/components/payroll/PayslipsTab.tsx` | Update filename format in `handleDownloadSingle`; rewrite `handleDownloadAll` to fetch all PDFs, bundle into ZIP via JSZip, and trigger single download |

## Technical approach

**Filename helper** (used in both single and bulk download):
```typescript
const getPayslipFilename = (employee, periodStart) => {
  const month = format(new Date(periodStart), 'MMMM');
  const year = format(new Date(periodStart), 'yyyy');
  const code = employee?.employee_code || 'UNKNOWN';
  const name = `${employee?.first_name}_${employee?.last_name}`;
  return `${code}_${name}_Salary_Slip_${month}_${year}.pdf`;
};
```

**Download All flow**:
1. For each generated payslip, fetch PDF blob via signed URL
2. Add each blob to JSZip with the correct filename
3. Generate ZIP blob and trigger browser download

