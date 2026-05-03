## Goal

Replace hard-coded Tailwind palette colors with semantic design tokens across four folders only:
- `src/components/approvals/`
- `src/components/audit/`
- `src/components/loans/`
- `src/components/payroll/`

No behavior, layout, or text changes. No files outside these folders. `src/components/ui/` is excluded.

## Mapping rules (applied uniformly)

| Hard-coded | Semantic replacement |
|---|---|
| `bg-emerald-*` / `bg-green-*` (solid 400–700) | `bg-success` |
| `bg-emerald-50/100`, `bg-green-50/100` | `bg-success/10` |
| `bg-emerald-900/30` etc. (dark soft) | removed (token adapts) |
| `text-emerald-*` / `text-green-*` | `text-success` |
| `border-emerald-*` / `border-green-*` | `border-success/30` |
| `bg-red-*` solid | `bg-destructive` |
| `bg-red-50/100`, dark `bg-red-950/30` | `bg-destructive/10` |
| `text-red-*` (any shade, light or dark) | `text-destructive` |
| `border-red-*` | `border-destructive/30` |
| `bg-amber-*` solid 400–800 | `bg-warning` |
| `bg-amber-50/100`, dark `bg-amber-950/50` | `bg-warning/10` |
| `text-amber-*` | `text-warning` |
| `border-amber-*` | `border-warning/30` |
| Paired `dark:(bg|text|border)-(emerald\|green\|red\|amber)-*` | removed entirely |
| `hover:bg-emerald-*` etc. | `hover:bg-success/90` |

## File-by-file changes

### src/components/approvals/ (6 files)

**ApprovalProgressSteps.tsx** (lines 29, 33, 107)
- `bg-emerald-500 text-white` → `bg-success text-success-foreground`
- `bg-amber-500 text-white` → `bg-warning text-warning-foreground`
- `bg-emerald-500` (connector dot) → `bg-success`

Result: approved steps stay positive-green, in-progress stays warning-amber.

**ApprovalCard.tsx** (lines 77–79, error banner)
- `bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800` → `bg-destructive/10 border border-destructive/30`
- `text-red-600 dark:text-red-400` → `text-destructive`
- `text-red-700 dark:text-red-300` → `text-destructive`

**AllPendingApprovalsTab.tsx** (lines 120, 224, 232–234)
- L120 amber badge: `bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200` → `bg-warning/10 text-warning`
- L224 amber outline badge: `bg-amber-50 text-amber-700 border-amber-200` → `bg-warning/10 text-warning border-warning/30`
- L232–234 red error banner: same treatment as ApprovalCard

**TeamRequestsTab.tsx** (lines 40, 44)
- `<Badge className="bg-emerald-500">` → `bg-success text-success-foreground`
- `text-amber-600 border-amber-600` → `text-warning border-warning/30`

**MyRequestsTab.tsx** (lines 61, 65) — identical to TeamRequestsTab

**MobileApprovalsHub.tsx** (lines 29–30, empty-state success icon)
- `bg-emerald-100 dark:bg-emerald-900/30` → `bg-success/10`
- `text-emerald-600 dark:text-emerald-400` → `text-success`

### src/components/audit/ (1 file)

**AuditTable.tsx** (lines 40, 41, 43) — category icon backgrounds
- leave_request: `bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400` → `bg-success/10 text-success`
- loan: `bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400` → `bg-warning/10 text-warning`
- compensation: `bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400` → `bg-success/10 text-success`

Note: leave_request and compensation will both now read green/success — semantically correct (both are positive-status categories) and consistent with the brand palette which has no separate "emerald vs green" distinction.

### src/components/loans/ (6 files)

**LoanStatusBadge.tsx** (lines 27–28)
- `status === "active" && "bg-emerald-600 hover:bg-emerald-700"` → `bg-success text-success-foreground hover:bg-success/90`
- `status === "approved" && "bg-emerald-500 hover:bg-emerald-600"` → `bg-success text-success-foreground hover:bg-success/90`

**LoansTable.tsx** (lines 148, 225) — "Yes" text in installment-paid columns
- `text-emerald-600` → `text-success` (both occurrences)

**LoanInstallmentsTable.tsx** (line 42) — paid badge
- `bg-emerald-500 hover:bg-emerald-600` → `bg-success text-success-foreground hover:bg-success/90`

**LoanInstallmentsSection.tsx** (lines 147, 280)
- L147 paid badge: `bg-emerald-500` → `bg-success text-success-foreground`
- L280 inline "paid" hint: `text-emerald-600` → `text-success`

**LoanEventsTimeline.tsx** (lines 23, 25, 26, 27) — event color tokens
- disburse `text-green-600` → `text-success`
- restructure `text-amber-600` → `text-warning`
- skip_installment `text-amber-600` → `text-warning`
- manual_payment `text-emerald-600` → `text-success`

**SkipInstallmentDialog.tsx** (line 94) — warning callout
- `border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200` → `border-warning/30 bg-warning/10 text-warning`

### src/components/payroll/ (2 files)

**templates/SmartTagsTab.tsx** (line 190)
- `text-green-500` (Check icon) → `text-success`

**templates/PayslipEmailTemplateTab.tsx** (line 105)
- `bg-green-500/10 text-green-600 border-green-200` → `bg-success/10 text-success border-success/30`

## Verification after edit

1. Re-run the same ripgrep across the four folders and confirm zero matches.
2. Visual check (key surfaces): approval progress steps (approved=green, current=amber), audit table category pills, loan status badge for `active`/`approved`, paid installment badge, loan events timeline icons, error banners on ApprovalCard / AllPendingApprovalsTab, payroll smart-tag check icon and email-template active pill.
3. Dark mode: tokens (`--success`, `--warning`, `--destructive`) are already defined in `.dark` in `src/index.css`, so removing `dark:` overrides is safe.

## Out of scope (untouched)

- `src/components/attendance/LeaveStatusBadge.tsx`, `src/components/benefits/ClaimStatusBadge.tsx`, calendar event-color data, employee/timeoff/dashboard hard-codes — not in the four named folders.
- `src/components/ui/*` — explicitly excluded.
- `payroll/PaymentStatusBadge.tsx` and `payroll/PayrollRunStatusBadge.tsx` — already token-based, no changes.

## Risk

Very low. Pure className swap, no logic touched. The only semantic compression is audit's `compensation` and `leave_request` both becoming "success" green (previously emerald vs green — visually indistinguishable in DGC's single-green palette anyway).

Approve to apply.