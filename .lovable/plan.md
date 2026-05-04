## Identification

Line 116 in `src/components/timeoff/TimeOffSummaryCard.tsx` sits inside the fourth `SummaryItem` of the Time Off summary card. The surrounding props are:

- `icon={<Flag className="w-4 h-4" />}`
- `days={totalHolidays}`
- `label="Public Holidays"`
- `sublabel={`${remainingHolidays} remaining in ${displayYear}`}`

It represents **Public Holidays** — a neutral category tile (count of statutory holidays for the year). It is not used/pending/approved/remaining leave; it has no positive or negative meaning.

Per the mapping rule: *purely a category color with no positive/negative meaning → `bg-muted`*.

Note: `SummaryItem` renders white text/icons over `bgColor`. `bg-muted` is a light surface, so white-on-muted will have poor contrast. Flagging this — but per the user's strict mapping rule, `bg-muted` is the prescribed token. Implementation will apply `bg-muted` exactly as instructed; if contrast becomes an issue, that's a follow-up.

## Change

**File:** `src/components/timeoff/TimeOffSummaryCard.tsx`
**Line 116:**
- Before: `bgColor="bg-rose-400/85"`
- After: `bgColor="bg-muted"`

No other lines or files are touched.
