# MediSchedule

A multi-role healthcare scheduling app built as a learning project to practice Next.js App Router, server-first data fetching, role-based routing, and clean component architecture.

Live architecture notes: [/case-study](http://localhost:3000/case-study)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Auth | Auth.js v5 (NextAuth) — Credentials provider, JWT session (hardcoded test users, DB migration pending) |
| Database | PostgreSQL, accessed via Prisma with the `@prisma/adapter-pg` driver adapter |
| Seed data | `@faker-js/faker` — used in `prisma/seed.ts` to generate realistic relational data |
| Validation | Zod + React Hook Form |
| UI primitives | Hand-rolled (no shadcn/ui) — wraps Radix UI for Select/Tabs/Dialog |
| Icons | Lucide React |
| Font | Geist |

---

## Getting Started

### 1. Start PostgreSQL

The app expects a Postgres instance matching your `DATABASE_URL` (e.g. `postgresql://postgres:postgres@localhost:5432/medischedule?schema=public`).

First-time setup with Docker:

```bash
docker run --name medischedule-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=medischedule \
  -p 5432:5432 \
  -d postgres:latest
```

If port `5432` is already in use, map it to `5433` instead and update `DATABASE_URL` accordingly.

If the container already exists, just start it:

```bash
docker start medischedule-postgres
```

Or use the combined dev script, which starts the container and the dev server together:

```bash
npm run dev:db
```

### 2. Install dependencies and set up the database

```bash
npm install
```

`npm install` triggers `postinstall`, which runs `prisma generate`. After that, apply migrations and seed the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `AUTH_SECRET` | Production only | Random secret for JWT signing. Dev uses a fallback. |
| `AUTH_TRUST_HOST` | Optional | Set to `true` on non-Vercel hosts. |

Generate a strong secret for production:
```bash
openssl rand -base64 32
```

---

## Demo Accounts

All accounts use `password123`. These are still hardcoded in `src/auth.ts` — migrating them into the database is the next planned step (see below).

| Role | Email | Access |
|---|---|---|
| Admin | `admin@medi.dev` | Full staff interface |
| Staff | `staff@medi.dev` | Full staff interface |
| Doctor | `doctor@medi.dev` | Full staff interface |
| Patient | `patient@medi.dev` | Patient dashboard only |

---

## Project Structure

```
src/
  app/
    (app)/            ← authenticated feature routes + shared sidebar layout
      dashboard/
      appointments/
      calendar/
      patients/
      patient-dashboard/
    (auth)/           ← public auth routes (no sidebar)
      login/
    api/              ← NextAuth route handler
    case-study/       ← architecture notes page
    components/       ← feature-level components
      ui/             ← reusable stateless primitives (Button, Card, Dialog …)
  lib/
    data.ts           ← repository layer — query functions, now backed by Prisma
    prisma.ts         ← Prisma client instance (pg driver adapter)
    types.ts          ← shared TypeScript interfaces
    validations/      ← Zod schemas (auth, appointment form, booking dialog)
  types/
    next-auth.d.ts    ← session augmentation — adds id and role to session.user
  auth.ts             ← NextAuth config, CredentialsProvider, JWT callbacks
prisma/
  schema.prisma       ← database schema
  seed.ts             ← Faker-generated seed data (20 patients, 8 doctors, 50 appointments), written via Prisma
```

---

## Current Status

### Done — frontend prototype

- [x] Role-based routing (admin / staff / doctor / patient)
- [x] NextAuth v5 credentials login with JWT session
- [x] Dashboard with stats and upcoming appointments
- [x] Appointments table with date + status filters
- [x] Multi-step booking wizard (patient → doctor → type → date/time → notes)
- [x] Patient list with search
- [x] Calendar view
- [x] Patient self-service dashboard with booking dialog
- [x] Design system reference page at `/design-system`
- [x] Architecture case study at `/case-study`

### Done — backend

- [x] **Prisma + PostgreSQL** — `src/lib/data.ts` now queries Postgres through Prisma (via `@prisma/adapter-pg`) instead of the old in-memory `faker-data.ts` store. Function signatures didn't change, so pages and components needed no updates.
- [x] **Seed script** — `prisma/seed.ts` uses `@faker-js/faker` to generate realistic, relationally consistent data (patients, doctors, appointments with FK references) directly into Postgres.

### Next

- [ ] **Migrate auth to DB users** — swap the hardcoded `testUsers` array in `src/auth.ts` for a `prisma.user.findUnique()` lookup with hashed password comparison.
- [ ] **Add API route handlers** — `GET/POST /api/appointments`, `GET /api/patients`, `GET /api/doctors` for client-side mutation flows.
- [ ] **Optimistic updates** — use `useOptimistic` for booking/cancellation once mutations hit the database.
- [ ] **Middleware route protection** — add `src/middleware.ts` as a secondary auth guard in addition to page-level checks.
- [ ] **End-to-end tests** — Playwright for role-redirect flows.

---

## Scripts

```bash
npm run dev      # start dev server at localhost:3000
npm run dev:db   # start the Postgres container, then the dev server
npm run build    # runs `prisma migrate deploy`, then production build
npm run start    # start the production server
npm run lint     # ESLint check
npx tsc --noEmit # TypeScript check (no output files)
```

`postinstall` runs `prisma generate` automatically after `npm install`.

---

## Architecture Notes

See the [case study page](/case-study) for a detailed breakdown of every architectural decision, trade-off, and the reasoning behind the component model, state strategy, and auth approach.