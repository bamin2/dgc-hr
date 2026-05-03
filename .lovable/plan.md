## Goal

Apply the same semantic-token mapping (success / destructive / warning / info) used in the previous batch to four more folders:
- `src/components/attendance/`
- `src/components/timeoff/`
- `src/components/timemanagement/`
- `src/components/business-trips/`

`src/components/ui/` is excluded. No logic, layout, or text changes.

## Mapping

| Hard-coded | Replacement |
|---|---|
| `bg-emerald-*` / `bg-green-*` solid | `bg-success` |
| `bg-emerald/green-50/100`, dark `*-900/30` | `bg-success/10` (drop dark pair) |
| `text-emerald-*` / `text-green-*` (incl. dark pair) | `text-success` |
| `border-emerald-*` / `border-green-*` | `border-success/30` |
| `bg-red-*` solid | `bg-destructive` |
| `bg-red-50/100`, dark `bg-red-950/*` | `bg-destructive/10` |
| `text-red-*` | `text-destructive` |
| `border-red-*` | `border-destructive/30` |
| `bg-amber-*` solid | `bg-warning` |
| `bg-amber-50/100`, dark `bg-amber-950/*` | `bg-warning/10` |
| `text-amber-*` | `text-warning` |
| `border-amber-*` | `border-warning/30` |
| `bg-blue-100` / `text-blue-600` / `bg-blue-500` (status dots & metric icons) | `bg-info/10` / `text-info` / `bg-info` |
| Paired `dark:` overrides | dropped (tokens auto-adapt) |

Special cases per user instruction: `AttendanceCalendar.tsx` legend dots → `bg-success`, `bg-destructive`, `bg-info`.

## File-by-file changes

### attendance/
- **LeaveStatusBadge.tsx** L15 approved → `bg-success/10 text-success border-success/30`; L19 rejected → destructive variant. (`pending` uses `yellow-*` — out of scope per mapping, leaving untouched.)
- **AttendanceStatusBadge.tsx** L11 success, L15 destructive, L27 warning — same `*/10 + */30` pattern.
- **CorrectionStatusBadge.tsx** L14 amber → warning variant; L26 green → success variant. (`pending_hr` uses teal — out of scope.)
- **LeaveRequestsTable.tsx** L126 approve button → `text-success hover:text-success hover:bg-success/10`; L133 reject → destructive equivalents.
- **LeaveRequestDetailView.tsx** L94 amber outline badge → warning; L115 emerald button → `bg-success text-success-foreground hover:bg-success/90`.
- **AttendanceMetrics.tsx** L19-20 green → success; L27-28 blue → info (icon bg/color tokens).
- **LeaveMetrics.tsx** L42-43 blue→info, L50-51 amber→warning, L58-59 green→success.
- **AttendanceCalendar.tsx** L80/L131 green dots → `bg-success`; L84/L140 red dots → `bg-destructive`; L92/L137 blue dots → `bg-info`. Legend remains visually distinct (green vs red vs gold-ish info from --info token).

### timeoff/
- **TimeOffSummaryCard.tsx** L109 `bg-amber-500/85` → `bg-warning/85`.
- **LeavesBalancesTab.tsx** L46-48 status map → success/warning/destructive `*/10` variants.
- **LeaveRequestDetailDialog.tsx** L20-22 same status map; L122-124 rejection-reason banner → destructive variant.
- **RequestTimeOffDialog.tsx** L247-248 low/negative balance pill borders+bg → warning/destructive `*/10` and `*/30`; L263-264 numeric color → text-destructive / text-warning; L272 pending count → text-warning; L415-418 insufficient-balance Alert → warning tokens (border + bg + title + description all `text-warning` / `bg-warning/10` / `border-warning/50`).

### timemanagement/
- **HolidaysTable.tsx** L131 amber badge → warning `*/10`.
- **PublicHolidaysTab.tsx** L151 → text-warning.
- **HolidayFormDialog.tsx** L174 → text-warning, L180 → text-success.
- **PublicHolidaysSection.tsx** L360 → text-warning, L368 → text-success.
- **LeaveEmailTemplatesTab.tsx** L118 active pill → success `*/10` set.
- **AssignLeaveBalanceDialog.tsx** L122 amber callout → warning `*/10` + `*/30`.

### business-trips/
- **TripApprovalsTab.tsx** L71 CheckCircle empty-state → text-success.
- **TripExpensesSection.tsx** L44-46 expense status map → success / info / destructive `*/10`.

## Out of scope (untouched)
- `LeaveStatusBadge.tsx` `pending` (yellow-* — outside the user's mapping).
- `CorrectionStatusBadge.tsx` `pending_hr` (teal — outside scope).
- `AuditTable.tsx` document/leave_balance/hr_document_request entries (teal/cyan/stone/purple) and any other non-listed palettes — not in user's mapping.
- `src/components/ui/*`.

## Verification
After edit, re-run ripgrep across the four folders for `(bg|text|border)-(emerald|green|red|amber|blue)-` (excluding the documented yellow/teal/stone/purple/cyan exceptions) and confirm only those exceptions remain. Visually confirm the AttendanceCalendar legend dots remain distinguishable: success (green), destructive (muted red), info (blue/charcoal per token) — three separate hues.

## Risk
Very low. Pure className swap. The `bg-warning/85` on TimeOffSummaryCard will render as a slightly more amber/orange tone than before (warning token is HSL `35 70% 45%` vs Tailwind amber-500); semantically identical.

Approve to apply.