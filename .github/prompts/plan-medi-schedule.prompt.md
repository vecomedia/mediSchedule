---
name: plan-medi-schedule
description: "Use when: continuing work on MediSchedule — implementing the next phase, picking up from the current build state, or checking what is done vs still missing."
---

Continue implementing MediSchedule based on [plan.mediSchedule.prompt.md](../../plan.mediSchedule.prompt.md).

## Task

1. Read `plan.mediSchedule.prompt.md` to understand the phased plan and current implementation status.
2. Inspect the current codebase state:
   - `src/app/(app)/` for existing pages
   - `src/app/components/ui/` for available components
   - `src/lib/` for data layer and types
   - `src/auth.ts` for auth setup
3. Identify the **next incomplete phase or step** based on what exists vs what the plan requires.
4. Implement the next step. Use the `nextjs-react-starter` skill for route, form, and component patterns.

## Constraints

- No shadcn/ui — build components in `src/app/components/ui/` manually
- Keep data access in `src/lib/data.ts` query functions (Prisma-ready swap points)
- Server Components by default; add `"use client"` only when needed
- Follow the color palette: `blue-600` primary · `emerald-*` success · `amber-*` warning · `slate-*` neutral
- Test users: `admin@medi.dev / password123` · `reception@medi.dev / password123`

## Done When

All verification criteria in `plan.mediSchedule.prompt.md` pass:
- `/design-system` renders all UI components
- `/login` → valid credentials → `/dashboard`, invalid → Zod error shown
- Unauthenticated access to `/dashboard` redirects to `/login`
- Dashboard shows Faker-generated data (patient count, appointments)
- Appointment booking form validates with Zod
