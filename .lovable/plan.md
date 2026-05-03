## Goal

Migrate every hard-coded Tailwind palette color in `src/components/employees/` (root + `wizard/` + `documents/`) to DGC semantic design tokens. Drop all `dark:` palette overrides since semantic tokens handle theme already.

## Scope

30 files contain palette classes (127 occurrences). All `.tsx` files under `src/components/employees/`. `src/components/ui/` is not touched.

## Color mapping

Standard status mapping (applied app-wide):
- emerald / green → `success` (`bg-success/10`, `text-success`, `bg-success`, `border-success/30`)
- red → `destructive` (`bg-destructive/10`, `text-destructive`, `bg-destructive`)
- amber / yellow → `warning` (`bg-warning/10`, `text-warning`, `bg-warning`)
- blue / sky → `info` (`bg-info/10`, `text-info`)

Decorative / neutral palettes (teal, orange, violet, indigo, rose, pink, purple, cyan) → semantic match by intent:
- teal / orange used as decorative chips with no status meaning → `bg-muted text-muted-foreground` or `bg-primary/10 text-primary`
- orange used as a status (e.g., "skipped", "damaged") → `warning`

Wizard task category mapping (`OnboardingTaskList.tsx`, `TaskCustomizeStep.tsx`):
- documentation (teal) → `text-primary`
- training (amber) → `text-warning`
- setup (orange) → `text-muted-foreground`
- introduction (green) → `text-success`
- compliance (red) → `text-destructive`

Onboarding task list status (per request):
- pending (amber) → `text-warning`
- done (green) → `text-success`
- blocked (red) → `text-destructive`

`AssigneeBadge` chip categories (decorative, no status semantics):
- hr (teal) → `bg-primary/10 text-primary`
- manager (green) → `bg-success/10 text-success`
- it (orange) → `bg-muted text-muted-foreground`

`OnboardingStatusBadge`:
- completed → success, in_progress → info (was teal), pending → warning, blocked → destructive

`StatusBadge` (employee status):
- active → success, on_leave (orange) → warning, probation (yellow) → warning, terminated → destructive

`TaskStatusBadge`:
- in_progress (blue) → `info`, completed (green) → `success`, skipped (orange) → `warning`

`AssetReturnStep`: pending(yellow)→warning, good→success, damaged(orange)→warning, missing→destructive

`AccessRevocationStep`: active(green)→success, scheduled(teal)→info; the `text-teal-600` count metric → `text-info`

`OffboardingReviewStep`: green→success, yellow→warning, teal→info badges

## Dark-mode cleanup

Strip every `dark:bg-*`, `dark:text-*`, `dark:border-*` paired override on the touched classes. Semantic tokens already adapt via `src/index.css`.

## Solid-color action buttons

`bg-emerald-600 hover:bg-emerald-700` (OrgChart confirm, OrgChartNode +, DraggableOrgNode +, OnboardingWizard finish): keep as primary action with success semantics → `bg-success text-success-foreground hover:bg-success/90`. Offboarding final-action button (`bg-red-600`) → `bg-destructive text-destructive-foreground hover:bg-destructive/90`.

## Files to modify

Root:
- AssigneeBadge, OnboardingStatusBadge, StatusBadge, TaskStatusBadge, OnboardingTaskList, OnboardingProgress (verify), OrgChart, OrgChartNode, DraggableOrgNode, EmployeeBenefitsTab, EmployeeLoansTab, EmployeeTimeOffTab, EmployeeActivityTab, EditSalaryDialog, SalaryHistoryCard, FormerEmployeesTable, ImportHistoryDialog, ResetPasswordDialog, CreateLoginDialog, BalanceAdjustmentDialog

wizard/:
- OnboardingWizard, OffboardingWizard, WorkflowSelectStep, TaskCustomizeStep, TeamAssignStep, ReviewStep, AssetReturnStep, AccessRevocationStep, OffboardingReviewStep, WizardProgress

documents/:
- DocumentCard

## Verification

After edits:
1. `rg -n -g '*.tsx' '(emerald|green|red|amber|blue|yellow|orange|sky|teal|violet|indigo|rose|pink|purple|cyan|lime|fuchsia)-[0-9]+' src/components/employees` returns no results.
2. `rg -n 'dark:(bg|text|border)-(emerald|green|red|amber|blue|yellow|orange|teal|sky)' src/components/employees` returns no results.
3. Manual smoke check (mentally) of the four flows the user listed: Employees list (StatusBadge, OnboardingStatusBadge), Employee profile tabs (Benefits/Loans/Time-Off/Activity/Salary history), Onboarding wizard (WorkflowSelect → TaskCustomize → Review → final button), Org chart (drag-drop highlight + add-child button).

## Notes

- DGC brand kept intact: primary stays Deep Green, gold reserved for primary CTAs (no change here — these are status surfaces, not CTAs).
- No new tokens needed; `success`, `warning`, `destructive`, `info`, `primary`, `muted` already exist (used by previous batches: dashboard, benefits, myprofile).
