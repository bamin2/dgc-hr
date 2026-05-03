# Auth pages: hardcoded colors → semantic tokens

## Problem

`src/components/auth/AuthLeftPanel.tsx`, `SignInForm.tsx`, and `ResetPasswordWizard.tsx` use ~30+ inline hex values (`#0F2E2B`, `#C8A14A`, `#F7F8F6`, `#1A1A1A`, `#6B7280`, `#E6E8E3`, `#FFFFFF`, `#ef4444`, `rgba(231,226,218,…)`) and inline `style={{}}` props for nearly every color, hover state, and focus border.

These literals already match values defined in `src/index.css` as semantic tokens (`--primary`, `--accent`, `--background`, `--foreground`, `--muted-foreground`, `--border`, `--card`, `--destructive`). The duplication means:
- Dark mode renders the auth screens with light-mode literals.
- Future brand tweaks to `index.css` silently skip the auth surface.
- Hover/focus is wired with imperative `onMouseEnter` / `onFocus` handlers instead of Tailwind variants.

## Token mapping

| Current literal | Token | Tailwind class |
|---|---|---|
| `#0F2E2B` / `#1C1F23` (left panel bg) | `--primary` | `bg-primary` (gradient kept via `from-primary to-primary/90`) |
| `#e7e2da` (left panel text) | `--primary-foreground` | `text-primary-foreground` |
| `rgba(231,226,218,0.2)` (decorative dots) | same | `bg-primary-foreground/20` |
| `#C8A14A` (gold CTA, focus ring, hover link) | `--accent` (DGC gold via accent slot) | `bg-accent` / `text-accent` / `focus:border-accent` |
| `#F7F8F6` (form panel bg) | `--background` | `bg-background` |
| `#FFFFFF` (input bg) | `--card` | `bg-card` |
| `#1A1A1A` (heading/label/input text) | `--foreground` | `text-foreground` |
| `#6B7280` (muted text, eye icon, links) | `--muted-foreground` | `text-muted-foreground` |
| `#E6E8E3` (input/divider border) | `--border` | `border-border` |
| `#ef4444` (error border) | `--destructive` | `border-destructive` |
| Microsoft 4-color logo squares | — | **keep as hex** (brand requirement) |

Note: project knowledge defines DGC Gold as the primary action color. The current `--accent` token (`12 88% 54%`, burnt orange) does not match `#C8A14A`. Two options:

- **A. Use `--accent` as-is** — auth CTA becomes burnt orange, consistent with the rest of the app's accent buttons. Simplest, fully token-driven.
- **B. Add a dedicated `--gold` token** (`38 50% 54%`) in `index.css` light + dark, plus `bg-gold` / `text-gold` utilities in `tailwind.config.ts`, and use it only on auth + any other gold surfaces.

Recommended: **A**. The rest of the app already uses `--accent` for CTAs; the auth screen should match. If the user wants gold preserved exclusively for auth, switch to B.

## Changes

### `src/components/auth/AuthLeftPanel.tsx`
- Remove inline gradient `style`; replace with `className="bg-gradient-to-br from-primary to-primary/90"` (or a single `bg-primary` if the gradient is not essential).
- Replace `style={{ color: '#e7e2da' }}` → `text-primary-foreground`.
- Decorative dot circles: `bg-primary-foreground/20`.
- Gold CTA dot: `bg-accent` (option A) or `bg-gold` (option B).
- Body copy: `text-primary-foreground/90`.

### `src/components/auth/SignInForm.tsx`
- Container: `bg-background` instead of inline `#F7F8F6`.
- Logo row label: `text-muted-foreground`.
- Headings & labels: `text-foreground`.
- Body copy: `text-muted-foreground`.
- Inputs: drop all inline `style` + `onFocus`/`onBlur`/`onMouseEnter` handlers. Use:
  - Base: `bg-card text-foreground border-border`.
  - Focus: `focus:border-accent focus:ring-1 focus:ring-accent` (Tailwind handles the state).
  - Error: conditional `border-destructive` instead of `errors.email ? '#ef4444' : '#E6E8E3'`.
- Eye toggle button: `text-muted-foreground hover:text-foreground` (drop the imperative mouse handlers).
- "Forgot password?" link: `text-muted-foreground hover:text-accent`.
- Sign-in button: `bg-accent text-accent-foreground hover:bg-accent/90` (drop inline style).
- Divider line: `border-border`; divider label: `bg-background text-muted-foreground`.
- Microsoft button: `bg-card text-foreground border-border hover:bg-muted`. Keep the four `<rect>` fills inside the SVG as literal Microsoft brand hexes.
- Footer border + text: `border-border`, `text-muted-foreground`.

### `src/components/auth/ResetPasswordWizard.tsx`
- Apply the same mapping. (File not yet read in this plan; the refactor will mirror SignInForm — replace every `style={{ color/background/border: '#…' }}` with the matching token class, and convert imperative hover handlers to Tailwind `hover:` variants.)

## Out of scope

- Visual redesign — geometry, spacing, sizes, copy, and SVGs are unchanged.
- Microsoft logo brand colors — kept verbatim.
- `index.css` token values — not modified under option A.

## Verification

- `rg "#[0-9A-Fa-f]{3,8}" src/components/auth` should return only the four Microsoft `<rect fill="…">` lines.
- `rg "style=\{\{" src/components/auth` should return zero matches.
- Manual check at `/auth` and `/auth/reset-password` in light mode (must look identical to today) and dark mode (must now adapt instead of staying light).
