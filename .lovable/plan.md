## Goal

Unify the operational UI and editorial/report styling on a single brand accent: **DGC Gold #C6A45E**. Burnt orange #F04E23 stops being the generic accent and is reserved for destructive-adjacent signals only (overdue, critical SLA pulse, hard errors).

## Scope

Token-level change in `src/index.css`, plus replacing hardcoded `#C6A45E` references in shared/report components with the new token so reports and the app share one source of truth.

## Changes

### 1. `src/index.css` — retune tokens

Light theme (`:root`):
- `--accent: 12 88% 54%` → `41 47% 57%` (DGC Gold #C6A45E)
- `--accent-foreground: 0 0% 100%` → `168 48% 11%` (Deep Green for AA contrast on gold)
- `--accent-soft: 12 88% 96%` → `41 47% 94%` (gold tint)
- `--ring: 12 88% 54%` → `41 47% 57%`
- `--chart-3: 12 88% 54%` → `41 47% 57%`
- `--chart-accent: 12 88% 54%` → `41 47% 57%`
- `--sidebar-primary: 12 88% 54%` → `41 47% 57%` (active rail = gold)
- `--sidebar-ring: 12 88% 54%` → `41 47% 57%`

Dark theme (`.dark`):
- `--accent: 12 88% 56%` → `41 50% 62%`
- `--accent-foreground: 0 0% 100%` → `168 48% 11%`
- `--accent-soft: 12 60% 14%` → `41 35% 16%`
- `--ring`, `--chart-3`, `--chart-accent`, `--sidebar-primary`, `--sidebar-ring` → `41 50% 62%`

Add new dedicated token for the burnt-orange "critical signal" use:
- `--critical: 12 88% 54%` (light) / `12 88% 56%` (dark)
- `--critical-foreground: 0 0% 100%`

`--destructive` stays as the muted red it already is (true error/destroy actions). `--critical` is the burnt-orange amber alarm tier between warning and destructive — used only for overdue, SLA breach pulse, hard error banners.

Update the comment block at the top of the file to reflect: "Burnt Orange #F04E23 — critical signals only (overdue / SLA / hard errors). Accent = DGC Gold #C6A45E."

### 2. `tailwind.config.ts` — expose `critical`

Add a `critical` color object alongside `destructive`:
```ts
critical: {
  DEFAULT: "hsl(var(--critical))",
  foreground: "hsl(var(--critical-foreground))",
},
```

### 3. Replace hardcoded `#C6A45E` with the token in shared components

These currently bypass tokens; switch them to `accent` / `accent-soft` / `accent-foreground` so any future re-tune flows from one place:

- `src/components/ui/button.tsx` (line 34): `ring-[#C6A45E]/40` → `ring-accent/40`
- `src/components/reports/ReportsMetrics.tsx` (lines 33–34): use `bg-accent/20 dark:bg-accent/10` and `text-accent-foreground dark:text-accent` (or `text-primary` for the dark contrast — verify in QA)
- `src/components/reports/PayrollChart.tsx` (line 61): `fill="#C6A45E"` → `fill="hsl(var(--chart-accent))"`
- `src/components/calendar/EventCard.tsx`, `EventDetailSheet.tsx`, `MonthView.tsx`, `CreateEventDialog.tsx`, `CalendarFilters.tsx`: the `gold`/`purple` event color keys → `bg-accent/10`, `border-l-accent`, `text-accent` variants. The user-facing "Gold" label stays.
- `src/data/timeoff.ts` (line 48): `paid_time_off` → `bg-accent/20 text-accent-foreground`
- `src/components/timemanagement/LeaveTypeFormDialog.tsx`: keep the literal `#C6A45E` here — it's a stored DB color value the user picks, not a style token. **No change.**
- `src/data/settings.ts` `primaryColor: '#C6A45E'`: stored seed value, **no change.**

### 4. Library files — keep but align comments

- `src/lib/brand-colors.ts`: keep `DGC_COLORS.gold = '#C6A45E'` as the canonical hex source. Update the file header comment to note: "These constants mirror the `--accent` CSS token. Prefer the token in components; use these only for non-CSS contexts (PDFs, charts via JS, email)."
- `src/utils/payslipGenerator.ts`, `src/utils/emailTemplates.ts`: PDF + email contexts (no CSS vars available) — leave the `#C6A45E` literal, which is now intentionally aligned with `--accent`. Already correct.

### 5. Out of scope / not changed

- `--destructive` stays muted red.
- `--warning` stays soft amber.
- The new `--critical` token is added but not retro-applied in this pass — that's a follow-up audit (overdue badges, SLA pulses). Today's pass only consolidates the accent.
- No component logic, no copy, no spacing, no typography changes.

## QA checklist

After the change, visually verify on `/`, `/approvals`, `/reports`, `/calendar`, `/settings`:
1. Sidebar active rail is gold, not orange.
2. Primary buttons / focus rings are gold.
3. In-progress / pending badges (which used `accent`) are gold; verify text contrast on gold (`accent-foreground` is now Deep Green, should read cleanly).
4. Reports page metric cards and `PayrollChart` "Taxes" bar match the rest of the UI exactly (same hue).
5. Destructive buttons / error banners stay red — unchanged.
6. Dark mode: gold on dark surface stays legible; ring visible on focus.
7. Scan for any remaining `#F04E23` literal references — none should appear in operational components.

## Files touched

- `src/index.css`
- `tailwind.config.ts`
- `src/components/ui/button.tsx`
- `src/components/reports/ReportsMetrics.tsx`
- `src/components/reports/PayrollChart.tsx`
- `src/components/calendar/EventCard.tsx`
- `src/components/calendar/EventDetailSheet.tsx`
- `src/components/calendar/MonthView.tsx`
- `src/components/calendar/CreateEventDialog.tsx`
- `src/components/calendar/CalendarFilters.tsx`
- `src/data/timeoff.ts`
- `src/lib/brand-colors.ts` (comment only)
