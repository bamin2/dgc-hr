## Goal
Migrate hard-coded Tailwind palette colors to semantic tokens across `src/components/myprofile/` (incl. `mobile/`), matching prior batches.

## Mapping
- `green-*` / `emerald-*` → `success` (soft bg `success/10`, border `success/20`, text `text-success`)
- `red-*` → `destructive` (Compensation negative-balance soft bg uses `bg-destructive/5` per request; border `destructive/20`)
- `amber-*` → `warning`
- `blue-*` (status/decoration) → `info`
- Drop all `dark:*` palette overrides — semantic tokens are theme-aware.

## Files & changes

**MyProfileCompensationTab.tsx** (lines 281–320)
- Allowances card: `border-green-200/50 dark:border-green-900/30` → `border-success/20`; `bg-green-50/50 dark:bg-green-950/20` → `bg-success/5`; icon/text greens → `text-success`.
- Deductions card: `border-red-200/50 dark:border-red-900/30` → `border-destructive/20`; `bg-red-50/50 dark:bg-red-950/20` → `bg-destructive/5` (per user instruction); icon/text reds → `text-destructive`.

**mobile/MobileSecuritySheet.tsx** (lines 94–100)
- Icon tile bg `bg-emerald-100 dark:bg-emerald-900/30` → `bg-success/10`; icon `text-emerald-600 dark:text-emerald-400` → `text-success`.
- "Current" badge `bg-emerald-100 text-emerald-700 dark:...` → `bg-success/10 text-success`.

**mobile/MobileDocumentsSheet.tsx** (line 133)
- `text-amber-600` → `text-warning`.

**MyProfileBenefitsTab.tsx** (lines 258–259)
- `bg-blue-100 dark:bg-blue-950/30` → `bg-info/10`; `text-blue-600` → `text-info`.

**MyProfileLoansTab.tsx**
- L110–120: amber Next-Payment row bg `bg-amber-50 dark:bg-amber-950/20` → `bg-warning/10`; icon/text amber → `text-warning`.
- L136: `text-green-600` → `text-success`.
- L203–204: `bg-amber-100 dark:bg-amber-950/30` → `bg-warning/10`; `text-amber-600` → `text-warning`.
- L214–215: `bg-blue-100 dark:bg-blue-950/30` → `bg-info/10`; `text-blue-600` → `text-info`.

**MyProfileTimeOffTab.tsx** (line 132)
- `text-amber-600` → `text-warning`.

**mobile/MobileProfileHeader.tsx** (lines 14–17)
- `active` → `bg-success/10 text-success`
- `on_leave` → `bg-warning/10 text-warning`
- `probation` → `bg-info/10 text-info`
- `on_boarding` → `bg-info/10 text-info`

**EditableField.tsx** (line 107)
- `text-green-600` → `text-success`.

## Verification
- `rg` re-scan of `src/components/myprofile/` returns no `green|emerald|red|amber|blue|orange|teal|violet|rose|pink|yellow|indigo|purple|sky|fuchsia-[0-9]` matches.
- Compensation tab: Deductions block still uses destructive tone (border `destructive/20`, soft `bg-destructive/5`, text/icon `text-destructive`) — meaning preserved.
- No changes under `src/components/ui/`.
