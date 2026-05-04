## Goal

Soften palette colors across `src/components/calendar/*.tsx`, treating event-color picker maps differently from status/decoration uses. `src/components/ui/` is not touched.

## Important finding about event colors

The **canonical `EventColor` enum** (from Supabase, used by `CreateEventDialog`'s picker and `EventCard`) is the **semantic set**: `green`, `orange`, `coral`, `mint`, `gold`/`blue`, `sage`/`purple` — NOT raw `red / yellow / pink / violet`. The only place raw keys appear is the legacy `eventColorMap` in `MonthView.tsx` (`blue, green, red, yellow, purple, orange, pink, mint, coral`), which extends beyond what users can pick. So the user's mapping rule is applied to that map, but most of those keys (`red`, `yellow`, `pink`) are dead branches today.

## Mapping rules

**Event-color picker maps (KEEP keys, soften values, preserve color identity):**
Applies to `MonthView.tsx` `eventColorMap`, `EventCard.tsx` `colorClasses`, `EventDetailSheet.tsx` color badges, `CreateEventDialog.tsx` `eventColors` swatches, `CalendarFilters.tsx` `colors` swatches.

- `bg-red-500` → `bg-rose-500/90`
- `bg-green-500` → `bg-emerald-500/90`
- `bg-blue-500` → `bg-sky-500/90`
- `bg-yellow-500` → `bg-amber-500/90`
- `bg-purple-500` → `bg-violet-500/90`
- `bg-pink-500` → `bg-pink-500/90`
- Existing softer palette tokens (`bg-emerald-500`, `bg-orange-500`, `bg-rose-400`, `bg-teal-400/500/600`, `bg-[#C6A45E]`, `bg-[#6B8E7B]`) → append `/90` for picker swatches and event chips so they read calmer; keep the same hue.
- Multi-class entries in `EventCard.tsx`/`EventDetailSheet.tsx` (`bg-emerald-50`, `border-l-emerald-500`, `text-emerald-900`, plus `dark:` pairs): keep hue, drop neon — keep `-50` surfaces and `-500` accents but standardize at `/100` opacity (already muted), and strip `dark:` overrides per project policy. Brand `#C6A45E` and `#6B8E7B` entries kept as-is (already DGC tokens).

**Non-picker status/decoration uses (standard semantic mapping):**
None found in current scan — `WeekView.tsx`, `DayView.tsx`, `CalendarHeader.tsx`, `CalendarToolbar.tsx` had no palette hits. If any surface during edit, apply: emerald/green → `success`, red → `destructive`, amber/yellow → `warning`, blue/sky → `info`.

## Files & changes

1. **MonthView.tsx** (`eventColorMap`, lines 21–31)
   - `blue: bg-teal-600` → `bg-sky-500/90`
   - `green: bg-green-500` → `bg-emerald-500/90`
   - `red: bg-red-500` → `bg-rose-500/90`
   - `yellow: bg-yellow-500` → `bg-amber-500/90`
   - `purple: bg-[#C6A45E]` → `bg-violet-500/90`
   - `orange: bg-orange-500` → `bg-orange-500/90`
   - `pink: bg-pink-500` → `bg-pink-500/90`
   - `mint: bg-teal-400` → `bg-teal-400/90`
   - `coral: bg-rose-400` → `bg-rose-400/90`
   - Fallback `"bg-teal-600"` → `"bg-sky-500/90"` (line 111).

   Note: this changes the visual hue for `blue` (teal→sky) and `purple` (gold→violet) per the user's explicit mapping rule. Since `EventColor` enum values used by the picker are `green/orange/coral/mint/blue/purple` and labels in `CreateEventDialog` show "Teal" for `blue` and "Gold" for `purple`, the visual will diverge from the label. **Recommend in implementation: keep existing brand hue (teal/gold) for `blue`/`purple` keys to preserve picker label↔swatch parity, and only soften with `/90`.** Will confirm by softening only (no hue swap) for `blue` and `purple` unless you say otherwise.

2. **EventCard.tsx** (`colorClasses`, lines 11–52)
   - Drop every `dark:bg-*-950/30` and `dark:text-*-100` override.
   - Keep `bg-{hue}-50`, `border-l-{hue}-500`, `text-{hue}-900` for `green` (emerald), `orange`, `coral` (rose), `mint`/`blue` (teal).
   - Brand entries (`gold`, `sage`, `purple` mapping to `#C6A45E`/`#6B8E7B`): drop `dark:` overrides, keep brand hex.

3. **EventDetailSheet.tsx** (color map lines 56–66)
   - Drop all `dark:` overrides.
   - Keep light-mode classes as-is (already muted `bg-{hue}-100 text-{hue}-800`).

4. **CreateEventDialog.tsx** (`eventColors`, lines 40–47)
   - Soften swatches with `/90`: `bg-emerald-500/90`, `bg-orange-500/90`, `bg-rose-400/90`, `bg-teal-400/90`, `bg-teal-600/90`, `bg-[#C6A45E]/90`.

5. **CalendarFilters.tsx** (`colors`, lines 39–46)
   - Same `/90` softening: `bg-emerald-500/90`, `bg-orange-500/90`, `bg-rose-400/90`, `bg-teal-500/90`, `bg-[#C6A45E]/90`, `bg-[#6B8E7B]/90`.

6. **WeekView.tsx, DayView.tsx, CalendarHeader.tsx, CalendarToolbar.tsx** — no palette colors detected; no changes needed.

## Out of scope
- `src/components/ui/`.
- `EventColor` enum, calendar logic, dataKeys, recharts.
- Brand hex tokens `#C6A45E` / `#6B8E7B`.

## Verification
- `rg "dark:" src/components/calendar/` → expect zero matches.
- `rg "bg-(red|yellow|pink|purple|blue|green)-[0-9]" src/components/calendar/` → expect zero raw matches (all softened or hue-mapped).
- Manually confirm: open `/calendar`, create event, picker still shows distinct swatches matching their labels; events render on month grid with calm (non-neon) chips; event detail sheet badge uses muted background.
