## Goal
Migrate hard-coded Tailwind palette colors to semantic tokens across `src/components/benefits/`. Drop dark-mode pair overrides.

## Mapping
- `green-*` / `emerald-*` → `success`
- `red-*` → `destructive`
- `amber-*` → `warning`
- `blue-*` / `sky-*` (status/decoration) → `info`
- Decorative chip palettes (violet, indigo, teal, orange, rose) used to differentiate plan/benefit categories — collapse to neutral semantic surfaces:
  - **Air ticket** (sky/info-coded) → `info`
  - **Phone allowance** (violet) → `bg-primary/10 text-primary` (DGC primary tone)
  - **Car/transport** (indigo) → `bg-primary/10 text-primary`
  - All other ad-hoc category chips in `BenefitTypeBadge` (teal/orange/rose/sky/indigo/violet) → `bg-muted text-foreground` for category tags so they remain visually distinct without injecting brand-conflicting hues. Only success/warning/destructive keep tonal meaning.

## Files & changes

**AirTicketUsageDialog.tsx**
- L126 `text-sky-600` → `text-info`
- L147 `text-emerald-600` / `text-amber-600` → `text-success` / `text-warning`
- L196 amber alert block → `bg-warning/10 border border-warning/30 text-warning`

**BenefitPlanCard.tsx**
- L48 sky info row → `text-info bg-info/10`
- L57 violet row (phone) → `text-primary bg-primary/10`
- L66 indigo row (car) → `text-primary bg-primary/10`
- L102 `text-emerald-500` → `text-success`

**BenefitStatusBadge.tsx** (status: active/pending/cancelled etc.)
- emerald → `bg-success/10 text-success`
- amber → `bg-warning/10 text-warning`
- red → `bg-destructive/10 text-destructive`

**BenefitTypeBadge.tsx** (category chips)
- emerald (medical-like positive) → `bg-success/10 text-success`
- amber → `bg-warning/10 text-warning`
- All decorative category chips (teal, orange, rose, sky, indigo, violet) → `bg-muted text-foreground` to keep them neutral and brand-safe.

**BenefitsMetrics.tsx**
- Plans tile teal → `bg-primary/10` / `text-primary`
- Active tile emerald → `bg-success/10` / `text-success`
- Pending tile amber → `bg-warning/10` / `text-warning`

**BenefitsTable.tsx**
- L58 sky → `text-info`
- L67 violet → `text-primary`

**ClaimStatusBadge.tsx**
- pending amber → `bg-warning/10 text-warning`
- review teal → `bg-info/10 text-info`
- approved emerald → `bg-success/10 text-success`
- rejected red → `bg-destructive/10 text-destructive`

**ClaimsTable.tsx**
- L77 emerald → `text-success`
- L96 emerald button hover → `text-success hover:text-success hover:bg-success/10`
- L104 red button hover → `text-destructive hover:text-destructive hover:bg-destructive/10`

**EditEnrollmentDialog.tsx**
- L276 indigo → `text-primary`
- L336 emerald → `text-success`

**EnrollmentDetailsDialog.tsx**
- L214, L226 emerald → `text-success`

**EnrollmentForm.tsx**
- L186 amber → `text-warning`
- L245 indigo card → `border-primary/20 bg-primary/5`
- L247 indigo header → `text-primary`
- L308 emerald → `text-success`

**EntitlementConfigFields.tsx**
- L13–14 sky block → `bg-info/10 border border-info/20`, header `text-info`
- L78–79 violet block → `bg-primary/5 border border-primary/20`, header `text-primary`

**EntitlementTrackingCard.tsx**
- Air ticket section (sky) → `info` family (border `info/20`, soft `info/10`, text `text-info`, button outline using `info/40` border + `info` text + `hover:bg-info/10`)
- Amber warnings → `text-warning`
- Emerald check states → `text-success`
- Phone (violet) section → `primary` family
- Car (indigo) section → `primary` family

**InsuranceCardExpiryBadge.tsx**
- amber expiring badge → `bg-warning/10 text-warning border-warning/30`
- emerald valid badge → `bg-success/10 text-success border-success/30`

**PhonePaymentDialog.tsx**
- L81 violet header icon → `text-primary`
- L112, L121 emerald/amber states → `text-success` / `text-warning`
- L131–137 "Fully Paid" emerald block → `bg-success/10 border border-success/20`, inner avatar `bg-success/20`, icon `text-success`, headings `text-success`

## Verification
- `rg` re-scan returns no `green|emerald|red|amber|orange|teal|violet|rose|pink|yellow|indigo|purple|sky|fuchsia|blue-[0-9]` matches under `src/components/benefits/`.
- Status meaning preserved: active=success, pending=warning, rejected=destructive, info accents=info.
- All decorative category chips remain visually distinct via neutral `bg-muted` while keeping the DGC palette clean.
- No changes under `src/components/ui/`.
