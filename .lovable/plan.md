## Goal

Eliminate hard-coded Tailwind palette colors (`text-emerald-*`, `bg-amber-*`, `border-red-*`, etc.) from `src/components/**` and `src/pages/**` and replace them with the semantic tokens already defined in `src/index.css` and `tailwind.config.ts`. No layout, spacing, copy, or behavior changes.

## Scope

- 160 `.tsx` files affected, ~688 occurrences total.
- Includes all 7 bento cards under `src/components/dashboard/bento/` that currently use palette colors (BusinessTripsCard, ApprovalsSummaryCard, ScheduleCard, TimeOffSnapshotCard, WelcomeCard, MobileStatusCards, MobileQuickActionsCard).
- Top offenders: `text-amber-600` (59), `text-green-600` (46), `text-emerald-600` (44), `bg-amber-100` (31), `bg-emerald-100` (30), `text-red-600` (28), etc.
- Excluded from rewrites: anything inside `src/components/ui/**` shadcn primitives **except** clear semantic misuses (e.g. `toast.tsx` red destructive variant). Primitives stay structurally untouched.
- Excluded: avatar / chart palette generators that intentionally cycle through palette hues for data series identity (e.g. category colors in OrgChart node legends, leave-type color dots driven by DB `color` field). These are data-driven, not semantic.

## Token Mapping

Single canonical mapping applied everywhere:

| Hard-coded class family | Semantic replacement |
|---|---|
| `*-emerald-*`, `*-green-*` (positive/approved/present/paid/active/success) | `success`, `success-foreground`, `success-bg` |
| `*-red-*`, `*-rose-*` (rejected/error/destructive/overdue) | `destructive`, `destructive-foreground`, `destructive-bg` |
| `*-amber-*`, `*-yellow-*`, `*-orange-*` (pending/warning/late/half-day) | `warning`, `warning-foreground`, `warning-bg` |
| `*-blue-*`, `*-sky-*`, `*-cyan-*`, `*-teal-*`, `*-indigo-*`, `*-violet-*`, `*-purple-*` (info/processing/remote/in-progress) | `info`, `info-foreground` (with `/10` opacity for backgrounds) |
| `*-pink-*`, `*-fuchsia-*` (rare highlight) | `accent`, `accent-foreground`, `accent-soft` |
| `*-slate-*`, `*-zinc-*`, `*-gray-*`, `*-neutral-*`, `*-stone-*` (neutral text) | `muted-foreground`, `muted`, `border` |

Background opacity convention:
- `bg-X-100`, `bg-X-50`  → `bg-{token}-bg` (or `bg-{token}/10` for info/accent which lack a `-bg` token)
- `bg-X-500/10`, `bg-X-900/30` (dark variants) → `bg-{token}/10` (works in light + dark via HSL token)
- `bg-X-500`, `bg-X-600` solid fills → `bg-{token}`
- `border-X-200`, `border-X-300` → `border-{token}/30`
- `text-X-400` (dark mode pair) collapses into the same semantic class — token already inverts via `.dark` block in `index.css`, so the explicit `dark:text-X-400` companion is removed.

## Approach

1. **Codify mapping** as a small Node script (`scripts/replace-palette-colors.mjs`, deleted after run) that:
   - Walks `src/components/**/*.tsx` and `src/pages/**/*.tsx`.
   - Skips `src/components/ui/**` except an allow-list (`toast.tsx`).
   - Skips files matching `// palette-colors: allow` opt-out marker (none expected, escape hatch only).
   - Applies regex replacements per the table above, including stripping the now-redundant `dark:` companion when both light + dark map to the same semantic token.
   - Writes a `scripts/palette-migration-report.json` listing every file + replacement count for audit.
2. **Run script** once; review the report.
3. **Manual pass on the 7 bento cards** to verify visual semantics (e.g. an "approved" pill must land on `success`, not `info`). Fix any contextual mismatches the regex got wrong (e.g. blue used as a brand accent rather than info → switch to `accent`).
4. **Manual pass on status badge components** (`AttendanceStatusBadge`, `LeaveStatusBadge`, `ClaimStatusBadge`, `CorrectionStatusBadge`, `OnboardingStatusBadge`, `TaskStatusBadge`, `StatusBadge`, `PaymentStatusBadge`) so each `statusConfig` object reads cleanly with semantic tokens (`bg-success/10 text-success border-success/20` etc.). These set the visual standard reused everywhere.
5. **Preserve data-driven colors**: leave `style={{ backgroundColor: leaveType.color }}` and chart palette arrays untouched.
6. **Delete the migration script and its report** before finishing.
7. **Verify**:
   - `npm run lint` — must pass with no new warnings.
   - `rg -g '*.tsx' -e '(text|bg|border)-(emerald|rose|violet|amber|blue|pink|green|red|sky|cyan|teal|indigo|purple|fuchsia|yellow|orange)-[0-9]' src/components src/pages` — must return zero hits (excluding the ui primitive allow-list, which will be empty after `toast.tsx` is fixed).
   - Spot-check `/dashboard`, `/time-off`, `/approvals`, `/payroll`, `/employees` in preview to confirm no visual regression.

## Technical Notes

- `success`, `destructive`, `warning` already have matching `-bg` and `-foreground` tokens defined in both light and dark blocks of `src/index.css` — no CSS additions needed.
- `info` and `accent` do **not** have a `-bg` token; we use `bg-info/10` / `bg-accent/10` for soft fills. This is consistent with existing usage in `PaymentStatusBadge.tsx`.
- DGC brand identity is preserved: Deep Green (`--primary`), Off-white (`--background`), Gold/Burnt Orange (`--accent`) remain the only brand surfaces. Status colors stay muted and professional per workspace rules.
- No new tokens, no new hex values, no inline styles introduced.
- 8pt spacing, Instrument Sans, shadcn/ui structure all untouched.

## Out of Scope

- Restyling components beyond the color swap.
- Touching `src/components/ui/**` shadcn primitives (except `toast.tsx`).
- Changing data-driven palette arrays (charts, leave-type dots, avatar fallback hues).
- Adding new design tokens.
