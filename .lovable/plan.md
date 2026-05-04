## Goal

Migrate hard-coded Tailwind palette colors across `src/pages/*.tsx` to semantic design tokens, and drop `dark:` palette overrides on status/decoration uses. `src/components/ui/` and everything outside `src/pages/` are untouched.

## Mapping rules (status / decoration)
- emerald / green → `success` (`text-success`, `bg-success`, `bg-success/10`)
- red / rose → `destructive`
- amber / yellow / orange → `warning`
- blue / sky / teal / indigo → `info`
- violet / purple / pink (decorative chips) → `bg-muted text-primary`
- Drop every `dark:{palette}-*` override on these uses (semantic tokens auto-adapt).

Liquid-glass surfaces (`dark:bg-white/*`, `dark:hover:bg-white/*`) are NOT palette overrides and are kept per the Liquid Glass UI core memory.

## Files & changes

### EmployeeProfile.tsx
- L757: `bg-green-500` → `bg-success` (status dot).
- L774: `bg-amber-500` → `bg-warning` (status dot).

### EmailActionResult.tsx (icons + gradient surfaces)
- L81: `text-amber-500` → `text-warning`.
- L85: `text-emerald-500` → `text-success`.
- L88: `text-red-500` → `text-destructive`.
- L90: `text-amber-500` → `text-warning`.
- L92: `text-red-500` → `text-destructive`.
- L100: `bg-gradient-to-br from-amber-50 to-amber-100` → `bg-gradient-to-br from-warning/10 to-warning/20`.
- L104: `from-emerald-50 to-emerald-100` → `from-success/10 to-success/20`.
- L107: `from-red-50 to-red-100` → `from-destructive/10 to-destructive/20`.
- L109: `from-amber-50 to-amber-100` → `from-warning/10 to-warning/20`.
- L111: `from-red-50 to-red-100` → `from-destructive/10 to-destructive/20`.

### PayslipTemplates.tsx
- L45: `active: "bg-emerald-500/10 text-emerald-600"` → `active: "bg-success/10 text-success"`.

### PayslipTemplateEditor.tsx
- L176: `<Badge className="bg-green-500 text-xs">Active</Badge>` → `<Badge className="bg-success text-success-foreground text-xs">Active</Badge>`.
- L200: `text-green-600` → `text-success`.

### ClaimSubmission.tsx
- L170: `text-amber-600` → `text-warning`.

### OnboardingDetail.tsx
- L279: `bg-green-500` → `bg-success` (timeline dot — Start Date).
- L288: `bg-teal-500` → `bg-info` (timeline dot — Scheduled Completion).

### PayrollRun.tsx
- L432: `text-green-500` → `text-success` (verified check icon).

### BenefitDetail.tsx (type-specific config cards + features)
- L109: `border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20` → `border-info/30 bg-info/5`.
- L111: `text-sky-700 dark:text-sky-400` → `text-info`.
- L135: `border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20` → `border-info/30 bg-info/5` (indigo treated as info).
- L137: `text-indigo-700 dark:text-indigo-400` → `text-info`.
- L152: `border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20` → `border-border bg-muted/50` (violet → muted decorative chip per rule).
- L154: `text-violet-700 dark:text-violet-400` → `text-primary`.
- L202: `text-emerald-600` → `text-success`.
- L226: `bg-emerald-100 dark:bg-emerald-900/30` → `bg-success/15`.
- L227: `text-emerald-600` → `text-success`.

### CandidateDetail.tsx
- L164: keep `dark:hover:bg-white/10` (liquid-glass surface, not a palette override). No change required.

## Out of scope
- Any file outside `src/pages/`.
- `src/components/ui/`.
- Liquid-glass `bg-white/*` and `dark:bg-white/*` patterns.

## Verification
- `rg "(emerald|green-[0-9]|red-[0-9]|amber-[0-9]|yellow-[0-9]|blue-[0-9]|sky-[0-9]|orange-[0-9]|teal-[0-9]|rose-[0-9]|violet|indigo|purple|pink-[0-9])" src/pages/` → expect zero matches.
- `rg "dark:(emerald|green|red|amber|yellow|blue|sky|orange|teal|rose|violet|indigo|purple|pink)-" src/pages/` → expect zero matches.
- Manual smoke: Employee profile (status dots), Email action result page (success/error/expired/reject states), Payslip Templates list + editor (Active badge), Onboarding detail timeline, Payroll run wizard last step, Benefit detail (Air Ticket / Car Park / Phone config cards + features list), Claim submission empty-enrollments warning.
