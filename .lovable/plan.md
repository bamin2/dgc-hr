## Goal
Port the **DGC Pulse (Task Tracker)** visual design system into DGC People without changing any business logic, data flows, routes, or component behavior. Purely a tokens + typography + surface refresh.

## What "design system" means here
The Task Tracker's look is defined entirely by three files:
1. `src/index.css` — CSS variables (colors, radius, shadows), base typography, utility classes (`container-page`, `eyebrow`, `surface-glass`, `surface-elevated`, `metric`, animations).
2. `tailwind.config.ts` — extended typography scale (`h1`/`h2`/`h3`/`h4`/`display`/`metric`/`eyebrow`/`body`/`caption`), color tokens (incl. `surface`, `accent-soft`, `success-bg`, `border-strong`, `primary-hover`, `chart-*`), `boxShadow` tokens, `borderRadius` (6px base), font families (Instrument Sans + Playfair + JetBrains Mono).
3. `index.html` — Google Fonts preload for **Instrument Sans**, Playfair Display, JetBrains Mono.

No component code from Task Tracker is copied. shadcn primitives in DGC People stay as-is — they re-skin automatically because they reference the same token names (`--primary`, `--background`, `--card`, `--border`, `--ring`, `--sidebar-*`, etc.).

## Visual changes the user will see
- **Typeface**: Inter → **Instrument Sans** across the whole app, with tighter letter-spacing on headings.
- **Color system**:
  - Primary brand color shifts from **DGC Gold (#C6A45E)** → **Deep DGC Green (#0F2A24)** on light backgrounds (buttons, links, focus rings on neutrals).
  - Accent / signal color shifts from **gold** → **DGC Burnt Orange (#F04E23)**, used for CTAs, active nav, focus rings, and chart highlights.
  - Background shifts from warm off-white → slightly cooler off-white (#F7F6F2-equivalent).
  - Sidebar stays deep green (already similar) but the active/hover state becomes burnt-orange instead of gold.
- **Radius**: cards/inputs become **less rounded** (6px base instead of 20px). This is the biggest visual shift — UI looks crisper and more "corporate".
- **Shadows**: switch to subtler hairline shadows (`--shadow-xs/sm/md/lg`).
- **Status colors**: success/warning/destructive/info gain matching `-bg` soft variants for tinted badges.
- **Dark mode**: re-tuned to charcoal foundation with the same accent.

## What is NOT touched
- No component files (`src/components/**`) are edited.
- No route, hook, query, or Supabase code.
- No layout structure changes (sidebar/header/page grids stay identical in markup).
- No Tailwind class names in components are renamed.
- Existing custom utilities currently in DGC People that components depend on (`surface-glass`, `surface-glass-elevated`, `text-heading-1/2/3`, `text-body`, `text-body-sm`, `text-caption`, `grid-layout`, `layout-*`, `responsive-container`, `glass`, `glass-subtle`, `safe-area-inset-bottom`, `pb-safe`, `scrollbar-thin`, `body.compact` rules) are **preserved** — added back into the new `index.css` so nothing visually breaks.

## Files to modify (3)
1. **`src/index.css`** — replace token block (`:root`, `.dark`) with Pulse tokens; replace base typography rules; add Pulse utilities (`container-page`, `container-content`, `eyebrow`, `hairline`, `metric`, `page-enter`, `animate-fade-up`, `animate-sla-pulse`); **keep all DGC People-specific utilities** (`surface-glass`, `surface-glass-elevated`, `glass`, `text-heading-*`, `text-body*`, `text-caption`, `grid-layout`, `layout-*`, `responsive-container`, `scrollbar-thin`, `safe-area-*`, mobile/compact blocks).
2. **`tailwind.config.ts`** — adopt Pulse `colors` (adds `surface`, `accent-soft`, `*-bg` variants, `border-strong`, `primary-hover`, `chart-accent`, `sidebar-muted`), `fontFamily` (Instrument Sans + serif + mono), `boxShadow` tokens, `borderRadius` scale, `transitionTimingFunction.refined`, `maxWidth.{content,page,prose}`, and Pulse keyframes/animations. **Keep** existing extras DGC People uses: the standardized `fontSize` scale (`xs/sm/base/lg/xl/2xl`) is preserved alongside Pulse's named sizes (`h1/h2/h3/h4/display/metric/eyebrow/body/caption`), spacing extras (`4.5/13/15/18`), `gap.grid`, and the `8xl/9xl/content` max-widths.
3. **`index.html`** — add the Google Fonts preload block for Instrument Sans, Playfair Display, JetBrains Mono. Update `theme-color` from `#0F2A28` → `#0F2A24` (subtle, matches new green). Title/description/manifest/icons untouched.

## Risk & mitigation
- **Risk**: Components hardcoded with `rounded-2xl` (≈100 places) will look less rounded after radius token change. This is *intended* — it's the Pulse aesthetic. No code change needed.
- **Risk**: Components using `text-2xl`/`text-xl`/`text-lg` continue to work because the Tailwind size keys are kept (mapped to the standardized scale). Pulse's named sizes (`text-h1`, `text-display`, etc.) are *added* — opt-in only.
- **Risk**: Anything referencing `border-strong`, `accent-soft`, `success-bg`, etc. didn't exist before — only added. No existing class breaks.
- **Risk**: Switching `--accent` from gold → orange will recolor focus rings, active sidebar item, and any `bg-accent`/`text-accent` usage. Verified this is the desired Pulse signal-color behavior.
- **Mitigation**: After the change, a quick visual smoke pass on Dashboard, Employee Profile (Time Off tab), Sidebar, Login screen, and one dialog (e.g. Add Leave Request) — no functional retesting needed.

## Out of scope
- No copying of Task Tracker components, pages, or layouts.
- No re-skinning of individual feature screens beyond what tokens automatically achieve.
- No PWA icon, manifest, or branding asset changes.
- No font self-hosting (loaded from Google Fonts, same as Task Tracker).
