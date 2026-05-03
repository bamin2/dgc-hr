## Goal

Apply the same semantic-token mapping (success / destructive / warning / info) to .tsx files in:
- `src/components/settings/`
- `src/components/notifications/`
- `src/components/documents/`
- `src/components/projects/`
- `src/components/requests/`

`src/components/ui/` is excluded. No behavior changes.

## Mapping (same as prior batches)

`emerald|green` → success · `red` → destructive · `amber` → warning · `blue` → info. Soft backgrounds use `*/10`, borders `*/30`. Drop all paired `dark:` overrides. Solid `*-500` for dot/icon decorations becomes the bare token (`bg-success`, `bg-info`, etc.).

## File-by-file changes

### projects/
- **ListSection.tsx** L23 `text-green-500` → `text-success`.
- **BoardColumn.tsx** L20 `text-blue-500` → `text-info`; L23 `text-green-500` → `text-success`.
- **ActivityItem.tsx** L14 `bg-green-500` → `bg-success`; L15 `bg-blue-500` → `bg-info`; L16 `bg-green-500` → `bg-success`; L19 `bg-blue-500` → `bg-info`. (`bg-orange-500` and `bg-muted-foreground` untouched — outside mapping.)

### settings/
- **payroll/FxRatesSection.tsx** L277-280 amber callout → `bg-warning/10 border-warning/30`, icon + text → `text-warning`.
- **payroll/AllowanceTemplatesSection.tsx** L121 `bg-emerald-500/10` → `bg-success/10`; L123, L125 `text-emerald-500` → `text-success`.
- **LogoPreviewSection.tsx** L104 `text-green-600` → `text-success`.
- **SessionCard.tsx** L29 emerald active badge → `bg-success/10 text-success` (drop dark pair).
- **email-templates/EmailTemplateCard.tsx** L45 active badge `bg-green-500/10 text-green-600` → `bg-success/10 text-success`.

### notifications/
- **NotificationsMetrics.tsx** L31-32 emerald → `text-success` / `bg-success/10`; L38-39 red → `text-destructive` / `bg-destructive/10`.
- **NotificationTypeBadge.tsx** L30-31 approval green → `bg-success/10` + `text-success` (drop dark pair); L40-41 document blue → `bg-info/10` + `text-info`. (`orange`, `yellow`, etc. untouched — outside mapping.)
- **NotificationCard.tsx** L24 `border-l-red-500 bg-red-50/50 dark:bg-red-900/10` → `border-l-destructive bg-destructive/10` (drop dark); L25 amber → `border-l-warning bg-warning/10`; L30 high badge → `bg-destructive/10 text-destructive`; L31 medium → `bg-warning/10 text-warning`. (`gray-*` low entries untouched.)

### documents/
- **HRDocumentRequestsTab.tsx** L126 amber outline → `text-warning border-warning/30 bg-warning/10`; L133 green → success variant; L140 red → destructive variant; L240 rejection callout `bg-red-50 text-red-700` → `bg-destructive/10 text-destructive`.
- **TemplateCategoryBadge.tsx** L17 salary_certificate green → `bg-success/10 text-success`; L22 experience_certificate amber → `bg-warning/10 text-warning`. (Teal/orange entries left untouched.)
- **SmartTagsTab.tsx** L220 active badge → `bg-success/10 text-success`.

### requests/
- **detail/HRDocumentRequestDetail.tsx** L23-25 status map → warning/success/destructive `*/10` + `*/30` set; L122-129 rejection banner → `border-destructive/30 bg-destructive/10`, all text → `text-destructive` (drop dark pairs).

## Out of scope
- `bg-teal-*`, `bg-orange-*`, `bg-yellow-*`, `bg-gray-*`, `bg-purple-*`, `bg-stone-*`, `bg-cyan-*` — outside the user's mapping (no replacement specified).
- `bg-muted-foreground` and similar token-based decorations — already semantic.
- `src/components/ui/*`.

## Verification

Re-run ripgrep across the five folders for `(bg|text|border)-(emerald|green|red|amber|blue)-` and confirm zero matches. Visual spot-check: notification priority strips/badges (high red, medium amber), notification type icons (approval green, document blue), HR document request badges (3 statuses), FX rates callout, allowance templates icons, project activity timeline dots, project list status icons.

## Risk

Very low. Pure className swap. The notifications metrics card now blends "today" and "approval" both into success-green (previously emerald vs green — visually indistinguishable in DGC palette). Acceptable per single-success-token policy.

Approve to apply.