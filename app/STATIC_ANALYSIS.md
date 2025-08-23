# ISO-Connect — Static Code Analysis & API Map

Generated: 2025-08-23

This document is a static analysis and high-level API map for the ISO-Connect Next.js application (app/). It summarizes architecture, data model, key API routes, notable components, security considerations, and recommended next steps / TODOs. Use this as a reference to onboard contributors or as the content for a new branch commit.

---

## 1) Summary / Purpose
ISO-Connect is a Next.js (App Router) TypeScript marketplace connecting companies with ISO consultants. It uses Supabase/Postgres for data storage, Prisma for ORM tooling, Radix + Tailwind for UI components, and Supabase Auth for authentication.

---

## 2) Tech stack (high-level)
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS, Radix UI, Lucide icons
- Supabase (Postgres, Auth)
- Prisma (client) — prisma schema present
- TanStack React Query / SWR / Zustand used in codebase
- Other libs: next-auth, bcryptjs, zod, yup, react-hook-form, mapbox, charting libs

---

## 3) Data model (from scripts/setup-database.sql + database.types)
Primary tables / types:
- users
  - id (UUID), role (company|consultant|admin), name, email, password_hash, created_at
- consultant_profiles
  - id, user_id -> users.id, headline, bio, standards (text[]), industries (text[]), certifications (text[]), case_snippets (JSONB), testimonials (JSONB), verified (boolean), regions (text[]), languages (text[])
- inquiries
  - id, company_id -> users.id, consultant_id -> users.id (nullable), message, timing, mode (remote|hybrid|onsite), status (sent|accepted|declined|closed), timestamps

RLS policies and triggers are defined in the SQL script for basic role-based access.

---

## 4) API map (files under `app/app/api`)

- /api/healthz
  - route.ts -> GET health check returning { status: "ok" }

- /api/auth/*
  - /auth/callback/route.ts -> OAuth / auth callback handling (Supabase/Next/Auth integration)
  - /auth/signup/route.ts -> Signup endpoint (creates user profile)

- /api/consultants
  - /api/consultants/route.ts -> GET listing of consultants (filters: standard, industry, region, search). Uses `createServerSupabaseClient()` to query `users` and `consultant_profiles`.
  - /api/consultants/[id]/route.ts -> GET single consultant by id

- /api/inquiries
  - /api/inquiries/route.ts -> POST to create inquiries, GET listing (company or consultant depending on session)
  - /api/inquiries/[id]/route.ts -> GET / PUT / possibly DELETE for a specific inquiry

- /api/admin/consultants
  - admin endpoints for fetching consultants and verifying consultant profiles
  - /api/admin/consultants/[id]/verify/route.ts -> POST or PUT to mark consultant verified

Notes:
- Most API routes use Supabase server helper (`lib/supabase-server.ts`) and rely on RLS and session-based auth.
- Query structure: supabase.from('users').select('*, consultant_profiles(*)') + filters.

---

## 5) Important client/server modules
- `app/lib/supabase.ts` / `supabase-server.ts` — supabase client factories for browser/server
- `app/lib/auth-context.tsx` — React auth provider using Supabase client, fetches user role
- `app/components/consultants-directory.tsx` — directory UI, client-side filtering
- `app/app/layout.tsx` and `app/page.tsx` — Root layout and main landing page
- `app/prisma/schema.prisma` & `app/scripts/setup-database.sql` — db schema reference and seed/demo data

---

## 6) Observed issues (runtime / build blockers from local attempts)
- Local npm installs encountered an EBUSY error removing a transient `.tailwindcss-*` folder under `node_modules` (locked resource).
- `node_modules` existed but `.bin/next` was missing until install completes; `package-lock.json` was not present after earlier partial installs.
- The developer experience will be smoother if the repository includes a package-lock or uses a reproducible install workflow (pnpm/workspaces or lockfile committed where appropriate).

---

## 7) Security & best-practice notes
- RLS policies are present but review audit logs and policy completeness (edge cases) recommended.
- Passwords are hashed with bcryptjs — ensure salts and bcrypt cost are configured correctly.
- Avoid committing secrets; `.env.example` exists. Document expected env variables in README more clearly.
- Add server-side input validation for API routes (Zod schemas or Yup) and consistent error mapping.

---

## 8) Recommended next steps (actionable TODOs)
- [ ] Fix local install EBUSY: stop any node processes, remove `.tailwindcss-*` directory, run `npm install` from `app/` (see troubleshooting steps).
- [ ] Commit the generated static analysis (this file) to a branch `analysis/static-report`.
- [ ] Add a CI workflow (GitHub Actions) that:
  - Installs dependencies
  - Runs typecheck (tsc)
  - Runs lint
  - Optionally builds the app (next build) + runs basic smoke test (hit /api/healthz)
- [ ] Add automated OpenAPI/Swagger generation for the api routes (or maintain manual API docs).
- [ ] Add unit & integration tests (Jest + React Testing Library) for:
  - API route handlers (mock supabase)
  - Core UI components (consultant list, profile)
- [ ] Improve error handling in API routes: return structured error objects, HTTP codes, and consistent logging.
- [ ] Add E2E tests (Playwright) for critical flows: signup, create consultant profile, company inquiry flow.
- [ ] Consider committing `package-lock.json` or switching to pnpm with lockfile for reliable installs & CI caching.
- [ ] Add Lighthouse/perf checks and image optimization (next/image improvements) for production.

---

## 9) Suggested commit details for branch `analysis/static-report`
- Branch name: `analysis/static-report`
- Files to add:
  - `app/STATIC_ANALYSIS.md` (this file)
  - `docs/INSTALL-TS-TRoubleshooting.md` (optional, when you want to add exact PowerShell steps)
- Commit message example:
  - "chore(analysis): add static code analysis & API map (ISO-Connect)"
- PR description template:
  - Summary of analysis, instructions for repo maintainers, list of recommended follow-ups.

---

## 10) Contacts & references
- Supabase setup doc in repo: `app/SUPABASE_SETUP.md`
- DB schema: `app/scripts/setup-database.sql`
- Prisma schema: `app/prisma/schema.prisma`
- Key components: `app/components/*` and `app/app/*`

---

If you want, I can now:
- create a branch `analysis/static-report`, add this file and push to origin (I will run the git commands and push) — requires your approval to perform git/network operations, or
- produce a separate `docs/INSTALL-TS-TRoubleshooting.md` with the PowerShell steps to fix the EBUSY install error and include it in the same branch, or
- both.

Reply with which of the following to do next (A/B/C):
A) Create branch `analysis/static-report`, add this file, commit and push to origin (I will run the git commands) — requires approval
B) Also add `docs/INSTALL-TS-TRoubleshooting.md` with step-by-step PowerShell commands for fixing EBUSY and include in the same branch, commit and push — requires approval
C) Neither — just keep this file locally and I'll tell you what to do next
