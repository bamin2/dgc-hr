## Goal
Normalize breadcrumbs across the requested detail pages so each page's `PageHeader` shows a clear path using data already loaded on the page. No back buttons; no other layout changes.

## Audit (current vs. requested)

| Page | Current breadcrumbs | Action |
|---|---|---|
| EmployeeProfile | `Employees › {fullName}` | Prepend `Dashboard` |
| CandidateDetail | `Hiring › {Name}` | No change — already correct |
| OfferDetail | `Hiring › {offer_code}` | Reshape to `Hiring › Offers › {Candidate Name}` |
| BusinessTripDetail | `Business Trips › Trip Details` | Use destination name as final crumb |
| LeaveRequestDetail | `Time Management › Leave Request Details` | Reshape to `Time Management › Leave Requests › {Employee}` |
| OnboardingDetail | `Employees › Onboarding › {Name}` | No change — already correct |
| BenefitDetail | `Benefits › {Plan name}` | No change — already correct |
| Payslip | `Payroll › Payslip` | No change — already correct |
| MyPayslip | `My Profile › Payslip` | No change — already correct |
| PayrollRun | No PageHeader; this is the new-run wizard, no run number exists yet | Skip — see note |
| PayslipTemplateEditor | `Payroll › Templates › {New Template / Edit Template}` | Use `template.name` as final crumb when editing |

### Note on `PayrollRun.tsx`
This file is a 4-step wizard for **creating** a new payroll run. There is no `runId`/`n` available — the run is only persisted on submit. Adding a `Payroll › Run #{n}` breadcrumb here would invent data. Recommend leaving as-is; if a separate "view existing run" page exists or is added later, it should carry the `Run #{n}` breadcrumb. Will not modify `PayrollRun.tsx` in this prompt.

## Changes

### `src/pages/EmployeeProfile.tsx` (line 342)
```tsx
breadcrumbs={[
  { label: "Dashboard", href: "/" },
  { label: "Employees", href: "/employees" },
  { label: employee.fullName },
]}
```

### `src/pages/OfferDetail.tsx` (line 56)
```tsx
breadcrumbs={[
  { label: 'Hiring', href: '/hiring' },
  { label: 'Offers', href: '/hiring' },
  { label: `${offer.candidate?.first_name ?? ''} ${offer.candidate?.last_name ?? ''}`.trim() || offer.offer_code }
]}
```
(Hiring page is the current home for offers; using `/hiring` for the Offers crumb keeps navigation valid without inventing a route.)

### `src/pages/BusinessTripDetail.tsx` (line 46)
```tsx
breadcrumbs={[
  { label: 'Business Trips', href: '/business-trips' },
  { label: trip.destination?.name || 'Trip Details' }
]}
```

### `src/pages/LeaveRequestDetail.tsx` (line 52)
```tsx
breadcrumbs={[
  { label: 'Time Management', href: '/time-management' },
  { label: 'Leave Requests', href: '/time-management' },
  { label: employeeName }
]}
```

### `src/pages/PayslipTemplateEditor.tsx` (line 124)
```tsx
breadcrumbs={[
  { label: 'Payroll', href: '/payroll' },
  { label: 'Templates', href: '/payroll/templates' },
  { label: isNew ? 'New Template' : (template?.name || 'Edit Template') }
]}
```

## Untouched
- `CandidateDetail.tsx`, `OnboardingDetail.tsx`, `BenefitDetail.tsx`, `Payslip.tsx`, `MyPayslip.tsx`: already match the spec.
- `PayrollRun.tsx`: skipped per note above.
- No back buttons added; no actions/layout/title/subtitle changes elsewhere.
