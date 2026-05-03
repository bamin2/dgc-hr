## Goal
Migrate hard-coded Tailwind palette colors to semantic design tokens across `src/components/hiring/` and `src/components/team/`, matching prior batches.

## Mapping
- `green-*` / `emerald-*` → `success`
- `red-*` → `destructive`
- `amber-*` / `orange-*` → `warning`
- `blue-*` (status/decoration) → `info`
- `teal-*` decorative chips → `bg-muted text-primary` (decorative "Variable" chip / NEW indicators per project rule for violet/rose/pink-style decorative chips; teal here is decorative, not status)
- Drop all `dark:*` palette overrides; semantic tokens handle theme.
- Soft backgrounds use `/10`; borders use `/20` or `/30` matching existing intent.

## Files to change

**hiring/**
- `templates/TemplateEditor.tsx` — line 349: `text-green-500` → `text-success`.
- `offers/OfferVersionEditor.tsx` — status badges:
  - Sent: `bg-blue-500` → `bg-info text-info-foreground` (fallback `bg-info text-white`)
  - Accepted: `bg-green-500` → `bg-success text-success-foreground`
  - Rejected: `bg-red-500` → `bg-destructive text-destructive-foreground`
  - Expired: `text-orange-500` → `text-warning`
  - Accept button: `bg-green-600 hover:bg-green-700 text-white` → `bg-success hover:bg-success/90 text-success-foreground`
  - Reject button: `text-red-600 hover:text-red-700` → `text-destructive hover:text-destructive/80`
- `conversion/ConvertToEmployeeDialog.tsx`:
  - icon `text-green-600` → `text-success`
  - alert: `bg-amber-50 border-amber-200` → `bg-warning/10 border-warning/30`
  - icon `text-amber-600` → `text-warning`
  - text `text-amber-800`, `text-amber-700` → `text-warning`
  - button `bg-green-600 hover:bg-green-700` → `bg-success hover:bg-success/90 text-success-foreground`
- `offers/CreateOfferWizard.tsx` — line 441: `text-amber-600` → `text-warning`.

**team/wizard/**
- `bulk-salary/BulkSalaryUpdateWizard.tsx` — `bg-emerald-600 hover:bg-emerald-700` → `bg-success hover:bg-success/90 text-success-foreground`.
- `bulk-salary/steps/ConfirmApplyStep.tsx` — `bg-green-500/10` → `bg-success/10`; `text-green-600` → `text-success`; drop `dark:text-green-400`.
- `bulk-salary/steps/ReviewSummaryStep.tsx` — all `text-green-600 dark:text-green-400` → `text-success`; `bg-green-500/10 border-green-500/20` → `bg-success/10 border-success/20`; `bg-green-500/20` → `bg-success/20`.
- `bulk-salary/steps/EffectiveDateStep.tsx` — `border-amber-500/50 bg-amber-500/10` → `border-warning/30 bg-warning/10`; `text-amber-600 dark:text-amber-400` → `text-warning`; `bg-amber-500/10` → `bg-warning/10`.
- `bulk-salary/steps/GosiSalaryStep.tsx` — `text-green-600` (and dark pair) → `text-success`.
- `bulk-salary/components/EmployeeCompensationCard.tsx` — decorative "Variable" chip `bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300` → `bg-muted text-primary` (decorative chip rule).
- `TeamCompensationStep.tsx`:
  - amber info card border/bg → `border-warning/30 bg-warning/10`; icon/text `text-amber-600`/`text-warning`.
  - line 353 teal decorative chip → `bg-muted text-primary`.
  - line 438 `bg-amber-50/50 dark:bg-amber-950/20` → `bg-warning/10`.
  - line 458 amber chip → `bg-warning/10 text-warning`.
  - line 511 `bg-green-500/10 border-green-500/20` → `bg-success/10 border-success/20`; `text-green-600 dark:text-green-400` → `text-success`.

## Out of scope (intentionally left alone)
- `prose-*` typography utilities (not palette colors).
- `bg-white text-black` inside `OfferLetterPreview` / `TeamOfferStep` printable preview surfaces — these intentionally render print/preview document styling and must stay.

## Verification
- `rg` re-scan of both folders should return no `green-|emerald-|red-|amber-|orange-|blue-(?!gray)|teal-` matches outside print-preview zones.
- No `dark:` palette overrides remain in changed lines.
- Status meaning preserved: increases = success, decreases/rejected = destructive, warnings = warning, sent = info.
- No changes under `src/components/ui/`.
