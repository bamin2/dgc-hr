# DGC HR

Internal Human Resources platform for **DGC Holding** — employee lifecycle, payroll, leave, benefits, hiring, and approvals in a single, mobile-first PWA.

- **Production:** https://hr.dgcholding.com
- **Lovable preview:** https://style-to-site-solver.lovable.app
- **Built on:** [Lovable](https://lovable.dev) + Lovable Cloud (Supabase)

---

## Features

### Workforce
- **Employees** — full directory, profiles, compensation, GOSI, documents, salary history, scheduled changes
- **Directory** — searchable, filterable people view with org hierarchy and chart export
- **My Profile** — self-service personal info, documents, payslips, HR letters
- **Onboarding & Offboarding** — wizard-driven flows with checklist tracking
- **Hiring** — candidates, offer letters, templated communications, conversion to employee

### Time & Leave
- **Time Off** (`/time-off`) — personal leave requests, balances, attachments
- **Time Management** (`/time-management`) — admin/HR oversight, manual entries, approvals
- **Attendance** — clock in/out, corrections, records
- **Calendar** — events, meetings, public holidays
- **Yearly leave rollover** via scheduled edge function

### Payroll & Compensation
- **Payroll runs** — multi-step wizard, adjustments, loan deductions, register persistence
- **Payslips** — docxtemplater + jsPDF generation, bulk download via JSZip, archived in Storage
- **Payslip templates** — visual editor with smart-tag merge fields
- **Bulk salary update** — CSV-driven bulk changes with effective dates
- **Loans** — issuance, installments, payroll-linked deductions
- **GOSI** — registered-salary-aware base calculation

### Benefits & Requests
- **Benefit plans, enrollment, claims** with document uploads
- **Business trips** — destinations, expenses, amendments
- **Approvals engine** — multi-step workflows, email notifications, self-approval prevention
- **Unified requests hub** — one inbox across all request types

### Documents & Reports
- **HR letters** — generated from templates with smart tags
- **Document management** — employee docs with RLS-enforced access
- **Reports** — employees, payroll, leave, loans, salary, hiring, compliance snapshots
- **Audit trail** — full change history with filters

### Platform
- **Role-based access** — `employee`, `manager`, `hr`, `admin` stored in a separate `user_roles` table with a `has_role()` security-definer function
- **Impersonation** — admins/HR can view as another user for support
- **Notifications** — in-app + email, consolidated via Postgres `upsert_notification`
- **Settings** — company, departments, positions, smart tags, work locations, banks, FX rates, allowances, deductions, approval workflows, email templates
- **PWA** — installable, offline indicator, service worker
- **Mobile-first** — bottom nav with route prefetching on touch, animated page transitions

---

## Tech stack

| Layer | Stack |
|---|---|
| Build | Vite 5, TypeScript 5, SWC |
| UI | React 18, Tailwind v3, shadcn/ui (Radix), framer-motion, lucide-react |
| Routing | React Router 6 (lazy routes + AnimatePresence transitions) |
| Data | TanStack Query 5, centralized query keys |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Editors | tiptap (rich text), react-easy-crop (avatar) |
| Documents | docxtemplater, pizzip, jspdf, jszip, file-saver, xlsx |
| Backend | Lovable Cloud (Supabase) — Postgres, Auth, Storage, Edge Functions |
| Testing | Vitest + Testing Library, Playwright (E2E) |

---

## Getting started

Prerequisites: **Node.js 18+** (use [nvm](https://github.com/nvm-sh/nvm)) and npm or bun.

```sh
# 1. Clone
git clone <YOUR_GIT_URL>
cd <PROJECT_DIR>

# 2. Install
npm install        # or: bun install

# 3. Run the dev server
npm run dev
```

Environment variables (Supabase URL + publishable/anon key) are auto-provisioned by Lovable Cloud and committed to `.env`. No manual setup needed when working through Lovable.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint across the project |
| `npx vitest` | Run unit tests (watch) |
| `npx vitest run` | Run unit tests once |
| `npx playwright test` | Run E2E tests |

---

## Project structure

```
src/
├── pages/              # Route-level components (lazy-loaded)
├── components/         # Feature + UI components (shadcn in components/ui)
├── hooks/              # Data hooks (React Query) and shared logic
├── contexts/           # Auth, Role, CompanySettings, CompactMode
├── lib/                # queryKeys, dateUtils, design-tokens, utils
├── data/               # Static config and seed-style modules
├── types/              # Shared TypeScript types
├── integrations/
│   └── supabase/       # Generated client + types
└── assets/             # Logos and static images

supabase/
├── functions/          # Edge functions (payslips, emails, rollover, etc.)
└── migrations/         # SQL migrations

e2e/                    # Playwright specs
```

---

## Architecture highlights

- **Lazy routes + transitions** — `AnimatedRoutes` wraps lazy pages with `AnimatePresence`; navigation direction is tracked via `useNavigationDirection`.
- **Nav prefetching** — `mobileNavPreloader` and `PrefetchNavLink` warm route chunks on touch/hover.
- **User preferences** — synced to Postgres (`user_preferences`) so display state (sidebar collapsed, density, dashboard layout) follows the user across devices.
- **Liquid-glass UI** — translucent surfaces with `backdrop-blur-lg` and the DGC palette (Deep Green `#0F2A28`, Off-white `#F7F7F5`, Gold `#C6A45E`).
- **8pt spacing**, Instrument Sans typography, semantic Tailwind tokens defined in `index.css` and `tailwind.config.ts` — no hardcoded colors in components.
- **Security** — RLS on every table; roles enforced via `has_role()` security-definer function (never stored on profile rows).

---

## Testing

- **Unit:** Vitest + Testing Library. Tests live in `src/**/__tests__/`.
- **E2E:** Playwright specs in `e2e/` (`auth`, `dashboard`, `employees`, `leave-requests`, `onboarding`, `payroll`).

```sh
npx vitest run
npx playwright test
```

---

## Deployment

- **Via Lovable** — open the project and click **Share → Publish**.
- **Custom domain** — `hr.dgcholding.com` (configured in Project → Settings → Domains).
- **GitHub sync** — this repo is two-way synced with Lovable. Pushes to `main` deploy automatically; edits in Lovable commit back here.

---

## Editing this codebase

You can develop in three ways:

1. **In Lovable** — prompt changes; they commit to this repo automatically.
2. **In your IDE** — clone, edit, push; changes sync back to Lovable.
3. **In GitHub** — edit files directly or use Codespaces.

---

## License

Proprietary — © DGC Holding. Internal use only.
