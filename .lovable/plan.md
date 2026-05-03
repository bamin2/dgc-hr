## Plan: Rewrite README.md

Replace the generic Lovable boilerplate `README.md` with a comprehensive, project-specific document for the **DGC Holding HR Platform**. Once approved (build mode), I'll write the file and it will sync to GitHub automatically via the existing Lovable ↔ GitHub integration.

### Proposed sections

1. **Header & Overview** — Project name (DGC HR), one-paragraph description, live URLs:
   - Production: `https://hr.dgcholding.com`
   - Lovable preview: `https://style-to-site-solver.lovable.app`

2. **Features** — Grouped list reflecting actual modules in `src/pages`:
   - Workforce: Employees, Directory, MyProfile, Onboarding/Offboarding, Hiring & Candidates
   - Time & Leave: Time Off, Time Management, Attendance, Calendar, Public Holidays
   - Payroll & Compensation: Payroll runs, Payslips, Payslip Templates, Bulk Salary Update, Loans, GOSI
   - Benefits & Requests: Benefits enrollment & claims, Business Trips, Approvals, Unified Requests
   - Documents & Reports: HR Letters, Document templates, Reports, Audit Trail
   - Platform: Notifications, Help Center, Settings, role-based access (employee/manager/hr/admin), impersonation
   - PWA: Installable, offline indicator, mobile-first navigation with route prefetching

3. **Tech stack** — Vite 5, React 18, TypeScript 5, Tailwind v3, shadcn/ui (Radix), React Router 6, TanStack Query 5, Supabase (Lovable Cloud), framer-motion, react-hook-form + zod, recharts, tiptap, docxtemplater, jspdf, xlsx, Playwright + Vitest.

4. **Architecture highlights** — Brief notes on:
   - Lovable Cloud (Supabase) for auth, DB, storage, edge functions
   - User roles in separate `user_roles` table with `has_role()` security definer
   - Centralized query keys, design tokens, date utils
   - Route-level lazy loading + nav prefetching + animated transitions

5. **Local development** — Prereqs (Node 18+, bun or npm), clone, install, `.env` requirements (Supabase URL + anon key auto-provisioned by Lovable Cloud), `npm run dev`.

6. **Scripts** — `dev`, `build`, `build:dev`, `lint`, `preview`, plus `vitest` and `playwright test`.

7. **Project structure** — Short tree of `src/` (pages, components, hooks, lib, contexts, integrations, types).

8. **Testing** — Unit tests with Vitest (`src/**/__tests__`), E2E with Playwright (`e2e/`).

9. **Deployment** — Via Lovable (Share → Publish) and custom domain (`hr.dgcholding.com`); GitHub two-way sync note.

10. **Design system** — Brief: DGC palette (Deep Green `#0F2A28`, Off-white `#F7F7F5`, Gold `#C6A45E`), 8pt spacing, Instrument Sans, liquid-glass surfaces.

11. **Contributing & License** — Internal project note; proprietary to DGC Holding.

### Out of scope
- No code changes, no new dependencies.
- Does not touch any other docs (`src/**/README.md` files remain as-is).
