---
name: nextjs-react-starter
description: "Use when: adding a new page, route, form, or component to MediSchedule. Covers route conventions, data access patterns, auth guards, form setup with react-hook-form + Zod, and custom ui/ component usage."
---

# MediSchedule — Next.js Feature Patterns

## Adding a New Protected Page

1. Create `src/app/(app)/<route>/page.tsx` — it is automatically protected by middleware.
2. Add the nav link in `src/app/(app)/layout.tsx`.
3. Fetch data with query functions from `src/lib/data.ts` (Server Component, no `useEffect`).

```tsx
// src/app/(app)/example/page.tsx
import { getPatients } from "@/lib/data";

export default async function ExamplePage() {
  const patients = await getPatients();
  return <ul>{patients.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

## Adding a Form Page

Use `react-hook-form` + Zod resolver. Define schema in `src/lib/validations/`.

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

const schema = z.object({ field: z.string().min(1) });
type FormData = z.infer<typeof schema>;

export default function ExampleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Label htmlFor="field">Field</Label>
      <Input id="field" {...register("field")} />
      {errors.field && <p className="text-red-500">{errors.field.message}</p>}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Using UI Components

All components are in `src/app/components/ui/`. Import directly — do NOT use shadcn.

```tsx
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
// variant props follow the DesignSystem.tsx reference
```

See `src/app/components/DesignSystem.tsx` or visit `/design-system` for all variants.

## Accessing Session / User Role

In Server Components:
```tsx
import { auth } from "@/auth";
const session = await auth();
const role = session?.user?.role; // "admin" | "receptionist"
```

In Client Components:
```tsx
"use client";
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

## Data Layer Pattern

Query functions in `src/lib/data.ts` return typed results from the in-memory faker store.
When Prisma is added later, only these functions change — types and components stay the same.

| Function | Returns |
|---|---|
| `getPatients(search?)` | `Patient[]` sorted by name |
| `getDoctors()` | `Doctor[]` |
| `getAppointments(filters?)` | `AppointmentDetails[]` |
| `getAppointmentById(id)` | `AppointmentDetails \| null` |

## Common Pitfalls

- `AppointmentDetails` ≠ `Appointment` — use the hydrated version when you need patient/doctor names
- Do not add `"use client"` to pages that only fetch data — keep them Server Components
- Tailwind 4 uses `@import "tailwindcss"` in CSS, not `@tailwind` directives
- NextAuth v5: use `auth()` not `getServerSession()`, handlers export named `{ handlers }`
