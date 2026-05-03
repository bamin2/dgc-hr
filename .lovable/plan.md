## Goal

Migrate hard-coded Tailwind palette colors and hex chart fills across `src/components/reports/` to semantic design tokens (status uses) and `--chart-*` tokens (chart series), preserving multi-series distinguishability and dropping `dark:` overrides on status/decoration uses. `src/components/ui/` is not touched.

## Mapping rules

**Status / decoration (badges, dot icons, KPI tiles, conditional text, borders):**
- emerald / green → `success` (`text-success`, `bg-success/10`, `border-success/30`)
- red / rose → `destructive`
- amber / yellow / orange → `warning`
- blue / sky / teal → `info`
- DGC gold `#C6A45E` and brand-toned tiles → `primary` (`text-primary`, `bg-primary/10`)
- Drop every `dark:` palette override on these uses (semantic tokens auto-adapt).

**Chart series (recharts `fill=`/`stroke=` and color arrays):**
- Replace hex palettes and `colors=[...]` arrays with `hsl(var(--chart-1))` … `hsl(var(--chart-5))`, using `hsl(var(--chart-accent))` for the highlighted/primary series.
- Preserve series count: 3 series → chart-1/2/3; 5 series → chart-1…5; donuts/distributions cycle through chart-1…5.
- Do NOT change chart logic, data shape, dataKeys, or layout.

## Files & changes

### Charts (palette-array fixes)
1. **PayrollChart.tsx** — `#22C55E`, `#C6A45E`, `#6B7B6E` → `hsl(var(--chart-accent))` (Net Pay, primary), `hsl(var(--chart-2))` (Taxes), `hsl(var(--chart-3))` (Benefits).
2. **LeaveChart.tsx** — `#4A6B5D`, `#22C55E`, `#F97316` → `hsl(var(--chart-1))`, `hsl(var(--chart-accent))`, `hsl(var(--chart-3))` (Taken / Remaining / Pending).
3. **SalaryDistributionChart.tsx**, **SalaryChangeTypeChart.tsx**, **SalaryTrendChart.tsx** — already use `hsl(var(--chart-*))`; verify the `colors` array spans `--chart-1`…`--chart-5` (no `--chart-1`/`--chart-2` repeats at index 5–6) and adjust if duplicated.

### Status / KPI tile fixes
4. **ReportsMetrics.tsx** — teal/emerald/amber/`#C6A45E` `iconBg`/`iconColor` pairs → `bg-info/10 text-info`, `bg-success/10 text-success`, `bg-primary/10 text-primary`, `bg-warning/10 text-warning`. Drop `dark:` variants.
5. **ReportTypeBadge.tsx** — teal/emerald/amber/orange palette → `bg-info/10 text-info`, `bg-success/10 text-success`, `bg-warning/10 text-warning`, `bg-primary/10 text-primary` (depending on category). Drop `dark:`.
6. **SalaryMetricsCards.tsx** — teal/emerald/amber `iconBg`/`iconColor` → info/success/warning tokens.
7. **DepartmentTable.tsx** — `text-red-600`/`text-emerald-600` → `text-destructive` / `text-success`.
8. **salary/SalaryReports.tsx** (lines 295, 298) — `text-emerald-600`/`text-red-600` change-amount conditionals → `text-success` / `text-destructive`.

### Compliance
9. **compliance/PayrollVarianceReport.tsx** — `text-green-500/600`, `text-red-500/600` → `text-success` / `text-destructive` for Trending icons, delta text, table cells.
10. **compliance/ComplianceSnapshotReport.tsx** — `border-red-200 bg-red-50/50`, `text-red-500/600`, `border-amber-200 bg-amber-50/50`, `text-amber-500/600`, `border-orange-200 bg-orange-50/50` → `border-destructive/30 bg-destructive/5 text-destructive`, `border-warning/30 bg-warning/5 text-warning`.
11. **compliance/GosiContributionReport.tsx** — teal/amber/emerald icon tiles → info/warning/success tokens; drop `dark:`.

### Payroll reports
12. **payroll/PayrollRunSummaryReport.tsx** — emerald/teal/amber tiles → success/info/warning; drop `dark:`.
13. **payroll/PayslipRegisterReport.tsx** — `text-emerald-600`/`text-amber-600` counters and badge classes → success/warning tokens; drop `dark:`.

### Loans, leave, overview
14. **loans/LoanSummaryReport.tsx** — amber/teal/emerald tiles → warning/info/success tokens; drop `dark:`.
15. **leave/LeaveBalanceReport.tsx** — teal/amber/emerald tiles → info/warning/success tokens; drop `dark:`.
16. **overview/WorkforceSnapshotCards.tsx** — teal/green/red icon prop pairs → info/success/destructive tokens; drop `dark:`.
17. **overview/LoanSnapshotCards.tsx** — rose/amber icon prop pairs → destructive/warning tokens; drop `dark:`.
18. **overview/InsightsSection.tsx** — emerald/rose icon tiles → success/destructive tokens; drop `dark:`.

### Out of scope
- `src/components/ui/` (not touched).
- Chart logic, dataKeys, recharts config.
- Shared `chart` token defs in `tailwind.config.ts` / `src/index.css`.

## Verification

- `rg "emerald|green-[0-9]|red-[0-9]|amber-[0-9]|yellow-[0-9]|blue-[0-9]|sky-[0-9]|orange-[0-9]|teal-[0-9]|rose-[0-9]|violet|indigo|purple|#[0-9a-fA-F]{3,8}|dark:" src/components/reports/` → expect zero matches in status/decoration files; chart token strings remain.
- Visually confirm Reports page: Overview, Salary, Payroll, Compliance, Loans, Leave tabs — each multi-series chart renders with distinct colors (chart-1…chart-5/accent), KPI tiles use semantic surfaces, badges intact in light + dark mode.
