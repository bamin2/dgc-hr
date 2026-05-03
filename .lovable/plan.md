## Goal
Migrate hard-coded Tailwind palette colors to semantic tokens across `src/components/dashboard/`, matching prior batches. Skip `bento/MobileQuickActionsCard.tsx`.

## Mapping
- `green-*` / `emerald-*` → `success`
- `red-*` → `destructive`
- `amber-*` / `orange-*` (when status) → `warning`
- `blue-*` (status/decoration) → `info`
- ScheduleCard's decorative `colorMap` (event chip dots) maps semantic-ish keys to palette swatches; remap to semantic tokens where reasonable: green→success, red→destructive, yellow→warning, blue→info, and for purely decorative (purple/orange/teal/pink) → keep palette-free fallbacks using `bg-primary`, `bg-warning`, `bg-info`, `bg-muted-foreground` to stay within the system. (See ScheduleCard section.)
- Drop all `dark:*` palette overrides.

## Files & changes

**ImpersonationBanner.tsx** — semantic warning banner
- L19: `bg-amber-500 text-amber-950` → `bg-warning text-warning-foreground`
- L22: `border-amber-600` → `border-warning/60`
- L24: `bg-amber-400 text-amber-950` → `bg-warning/80 text-warning-foreground`
- L40: `bg-amber-600 border-amber-700 text-amber-50 hover:bg-amber-700 hover:text-amber-50` → `bg-warning/90 border-warning text-warning-foreground hover:bg-warning hover:text-warning-foreground`

**TimeTracker.tsx** L118
- `bg-green-400 animate-pulse` → `bg-success animate-pulse`

**MobileNav.tsx** L173 (Sign Out hover)
- `hover:bg-red-500/10 hover:text-red-400` → `hover:bg-destructive/10 hover:text-destructive`

**admin/PayrollStatusCard.tsx** L52
- `text-emerald-500` → `text-success`

**admin/AllPendingApprovalsCard.tsx**
- L51: `border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20` → `border-warning/30 bg-warning/10`
- L57: `bg-amber-500 ... text-white` → `bg-warning text-warning-foreground`
- L84: `text-amber-600` → `text-warning`

**admin/LeaveTrendsCard.tsx** L37–38
- `text-red-500` → `text-destructive`
- `text-emerald-500` → `text-success`

**team/PendingApprovalsCard.tsx**
- L35 amber card → `border-warning/30 bg-warning/10`
- L51 `text-amber-600` → `text-warning`

**personal/MyRequestsCard.tsx** L35–50
- pending: `text-amber-500` / `bg-amber-500/10` → `text-warning` / `bg-warning/10`
- approved: `text-emerald-500` / `bg-emerald-500/10` → `text-success` / `bg-success/10`
- rejected: `text-red-500` / `bg-red-500/10` → `text-destructive` / `bg-destructive/10`

**admin/OrgOverviewCard.tsx** L42–50
- emerald → `text-success` / `bg-success/10`
- amber → `text-warning` / `bg-warning/10`

**bento/WelcomeCard.tsx**
- L155: `text-amber-500` → `text-warning`
- L165: `text-green-500` → `text-success`

**bento/TimeOffSnapshotCard.tsx**
- L70: `text-amber-600 bg-amber-500/10` → `text-warning bg-warning/10`
- L113: `text-amber-500` → `text-warning`
- L122: `text-green-500` → `text-success`

**bento/ScheduleCard.tsx** L11–20 colorMap
- green → `bg-success`
- blue → `bg-info`
- yellow → `bg-warning`
- red → `bg-destructive`
- purple → `bg-primary` (decorative — DGC primary)
- orange → `bg-warning` (closest meaning)
- teal → `bg-info`
- pink → `bg-muted-foreground` (neutral decorative)

**bento/MobileStatusCards.tsx**
- L124: `bg-amber-500/10 text-amber-600` → `bg-warning/10 text-warning`
- L134: `bg-blue-500/10 text-blue-600` → `bg-info/10 text-info`

**bento/ApprovalsSummaryCard.tsx** L56
- `text-amber-500` → `text-warning`

**bento/BusinessTripsCard.tsx** L63–156
- Plane icon tile: `bg-blue-500/10` / `text-blue-600` → `bg-info/10` / `text-info`
- Status pill (both occurrences L74/75 and L126/127): `bg-green-500/10 text-green-600` → `bg-success/10 text-success`; `bg-amber-500/10 text-amber-600` → `bg-warning/10 text-warning`
- L156 `text-amber-500` → `text-warning`

## Out of scope
- `src/components/dashboard/bento/MobileQuickActionsCard.tsx` (already migrated)
- `src/components/ui/*`

## Verification
- `rg` re-scan returns no `green|emerald|red|amber|orange|teal|violet|rose|pink|yellow|indigo|purple|sky|fuchsia|blue-[0-9]` matches in `src/components/dashboard/`.
- Status meaning preserved: pending=warning, approved=success, rejected=destructive, info accents=info.
- Impersonation banner remains a clearly distinct warning bar.
