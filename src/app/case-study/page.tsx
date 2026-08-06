export const metadata = {
	title: "Case Study – MediSchedule",
	description:
		"Architecture notes, component decisions, and technical trade-offs behind MediSchedule.",
};

function Section({
	id,
	title,
	kicker,
	children,
}: {
	id: string;
	title: string;
	kicker?: string;
	children: React.ReactNode;
}) {
	return (
		<section
			id={id}
			className="scroll-mt-24 rounded-[2rem] border border-slate-200/80 bg-white/90 p-7 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-9"
		>
			<div className="space-y-3 border-b border-slate-200 pb-5">
				{kicker && (
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
						{kicker}
					</p>
				)}
				<h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
			</div>
			<div className="mt-6 space-y-5">{children}</div>
		</section>
	);
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5">
			<h3 className="text-lg font-semibold text-slate-900">{title}</h3>
			{children}
		</div>
	);
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="max-w-3xl text-[15px] leading-7 text-slate-700 sm:text-base">{children}</p>;
}

function Tag({ label }: { label: string }) {
	return (
		<span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
			{label}
		</span>
	);
}

function Decision({
	choice,
	reason,
	tradeOff,
}: {
	choice: string;
	reason: string;
	tradeOff?: string;
}) {
	return (
		<div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)] space-y-3">
			<p className="text-base font-semibold text-slate-950">{choice}</p>
			<p className="text-sm leading-6 text-slate-600">{reason}</p>
			{tradeOff && (
				<p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800">
					<span className="font-semibold uppercase tracking-[0.14em]">Trade-off</span>: {tradeOff}
				</p>
			)}
		</div>
	);
}

function HighlightCard({
	title,
	value,
	description,
}: {
	title: string;
	value: string;
	description: string;
}) {
	return (
		<div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.35)]">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
			<p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
			<p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
		</div>
	);
}

function ReaderCard({
	audience,
	title,
	points,
}: {
	audience: string;
	title: string;
	points: string[];
}) {
	return (
		<div className="rounded-3xl border border-slate-200/80 bg-slate-950 p-6 text-slate-50 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.75)]">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{audience}</p>
			<h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
			<ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
				{points.map((point) => (
					<li key={point} className="flex gap-3">
						<span className="mt-2 h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
						<span>{point}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
			<div className="mt-4 space-y-4">{children}</div>
		</div>
	);
}

// ─────────────────────────────────────────────
// TOC
// ─────────────────────────────────────────────

const sections = [
	{ id: "overview", label: "Project Overview" },
	{ id: "structure", label: "Why This Structure?" },
	{ id: "components", label: "Why These Components?" },
	{ id: "state", label: "State Management" },
	{ id: "auth", label: "Auth & Role Model" },
	{ id: "data", label: "Data Layer" },
	{ id: "stack", label: "Tech Stack Decisions" },
	{ id: "lessons", label: "Lessons & Next Steps" },
];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function CaseStudyPage() {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#eef4f8_48%,_#f8fafc_100%)]">
			<header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Case Study</p>
						<h1 className="text-xl font-semibold tracking-tight text-slate-950">MediSchedule</h1>
					</div>
					<nav className="hidden items-center gap-1 text-xs text-slate-500 lg:flex">
						{sections.map((s) => (
							<a
								key={s.id}
								href={`#${s.id}`}
								className="rounded-full px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-950"
							>
								{s.label}
							</a>
						))}
					</nav>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
				<section className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_22rem] lg:items-start">
					<div className="space-y-8">
						<div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur sm:p-10">
							<div className="max-w-3xl space-y-6">
								<p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-700">
									Product, architecture, and delivery
								</p>
								<h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
									A scheduling app case study structured for review.
								</h2>
								<p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
									This page explains how MediSchedule was shaped: what problems it solves,
									which architectural decisions matter, and where the current implementation makes
									deliberate trade-offs.
								</p>
							</div>

							<div className="mt-8 flex flex-wrap gap-2">
						{["Next.js 16", "React 19", "TypeScript", "NextAuth v5", "Tailwind v4", "Zod", "React Hook Form", "Prisma", "PostgreSQL"].map(
							(t) => <Tag key={t} label={t} />,
						)}
							</div>

							<div className="mt-8 grid gap-4 sm:grid-cols-3">
								<HighlightCard
									title="Product Focus"
									value="Multi-role scheduling"
									description="Admin, staff, doctor, receptionist, and patient flows are modeled in one system so the app demonstrates role-based UX rather than a single happy path."
								/>
								<HighlightCard
									title="Architecture Focus"
									value="Server-first App Router"
									description="Data fetching stays close to the page, interactive state stays local, and route groups keep auth boundaries explicit."
								/>
								<HighlightCard
									title="Current Stage"
									value="DB-backed prototype"
									description="The data layer now runs on PostgreSQL via Prisma. Realistic seed data (patients, doctors, appointments) is generated once with Faker and written to the database, rather than kept in memory."
								/>
							</div>
						</div>

						<div className="grid gap-4 xl:grid-cols-2">
							<ReaderCard
								audience="General Information"
								title="What this project signals"
								points={[
									"The work reflects structured thinking: requirements are translated into clear roles, flows, and interfaces.",
									"The implementation shows ownership across product framing, UI architecture, authentication, and code organization.",
									"The write-up explains decisions in plain language, which is useful for collaboration beyond engineering.",
								]}
							/>
							<ReaderCard
								audience="Technical Information"
								title="What this page makes easy to inspect"
								points={[
									"Why the app uses route groups, Server Components, and local state instead of heavier global abstractions.",
									"How the component model separates reusable UI primitives from feature-level behavior.",
									"Which trade-offs were consciously accepted to keep the project lightweight and fast to run, and which of those trade-offs have since been resolved (like moving off in-memory data).",
								]}
							/>
							
						</div>

						<div className="space-y-10">
							<Section id="overview" title="Project Overview" kicker="Context">
								<P>
						MediSchedule is a healthcare scheduling learning project. The goal was to build a
						realistic multi-role application — covering admin, staff, doctor, and patient
						perspectives — while exploring patterns I wanted to solidify: role-based routing,
						server-first data fetching in the App Router, and a clean component boundary between
						UI primitives and feature components.
								</P>
								<P>
						The app is now backed by a real PostgreSQL database via Prisma. It started with data
						seeded entirely in memory using Faker.js, which was deliberate early on — it kept
						setup frictionless while I focused on UI architecture and auth flows. Faker.js is
						still used, but now only inside a one-time seed script that populates Postgres with
						realistic relational data.
								</P>
							</Section>

							<Section id="structure" title="Why This Structure?" kicker="Architecture">
								<P>
						The project uses the Next.js App Router with two route groups: <code>(app)</code> for
						authenticated feature pages and <code>(auth)</code> for the login flow. This
						separation means the authenticated shell layout (sidebar, nav) is applied once at the
						group boundary rather than duplicated across every page.
								</P>

								<Subsection title="Folder layout rationale">
						<div className="rounded-2xl bg-slate-900 text-slate-100 font-mono text-sm p-5 overflow-x-auto leading-7">
							<pre>{`src/
  app/
    (app)/            ← authenticated feature routes + shared layout
      dashboard/
      appointments/
      calendar/
      patients/
      patient-dashboard/
    (auth)/           ← public auth routes (no sidebar)
      login/
    api/              ← Route Handlers (tasks, NextAuth)
    case-study/       ← this page
    components/       ← feature-level components
      ui/             ← reusable, stateless UI primitives
  lib/
    data.ts           ← query functions (the "repository" layer, now backed by Prisma)
    prisma.ts         ← Prisma client instance (driver adapter for pg)
    types.ts          ← shared TypeScript interfaces
    utils.ts          ← cn() helper and small utilities
    validations/      ← Zod schemas
  prisma/
    schema.prisma     ← database schema
    seed.ts           ← Faker-generated seed data, written via Prisma
  types/              ← next-auth.d.ts session augmentation
  auth.ts             ← NextAuth config, credential provider`}</pre>
						</div>
								</Subsection>

								<Subsection title="Route groups over middleware">
									<P>
							Using <code>(app)</code> / <code>(auth)</code> route groups instead of a single
							middleware file keeps the auth guard co-located with the layout that needs it. Each
							page that belongs to the authenticated shell checks <code>auth()</code> at the top
							of its Server Component and redirects early — this is deliberate. It makes the flow
							obvious without relying on opaque middleware order.
									</P>
								</Subsection>
							</Section>

							<Section id="components" title="Why These Components?" kicker="Frontend Design">
								<P>
						Components are split into two clear layers: <strong>UI primitives</strong> and{" "}
						<strong>feature components</strong>. The primitives are intentionally thin wrappers
						around HTML with Tailwind classes and a minimal prop API. Feature components compose
						those primitives and contain domain logic.
								</P>

								<div className="grid gap-4 md:grid-cols-2">
						<Decision
							choice="Custom UI primitives instead of a full component library"
							reason="Writing Button, Card, Dialog, Input etc. from scratch (wrapping Radix UI for complex behavior like Select and Tabs) gives full control over the visual language and avoids shipping unused variants. For a learning project it's also the best way to understand what a design system actually does."
							tradeOff="Maintenance cost is higher than just dropping in shadcn/ui. For production that trade-off reverses."
						/>
						<Decision
							choice="AppointmentBookingDialog as a multi-step wizard"
							reason="The booking flow has four distinct decision points: patient → doctor → appointment type → date/time. Splitting them into steps reduces cognitive load and allows earlier validation (you can't move past step 1 without a patient). State for the wizard lives in a single useState object inside the component — no need for a form library here."
						/>
						<Decision
							choice="PatientDashboard as a Client Component, dashboard/appointments as Server Components"
							reason="The patient view needs interactive dialog state (booking dialog open/close). The staff views are mostly read-only data displays that benefit from being server-rendered — no JavaScript shipped for the table or filter UI."
						/>
						<Decision
							choice="Radix UI for Select and Tabs, native HTML for everything else"
							reason="Select and Tabs have non-trivial keyboard navigation and ARIA requirements. Radix handles that correctly. Everything else (buttons, inputs, cards) is simple enough to build natively with full control."
						/>
					</div>
							</Section>

							<Section id="state" title="State Management" kicker="Data Flow">
								<P>
						There is intentionally no global state manager (no Zustand, no Redux, no Context).
						The approach is: <strong>server state lives on the server</strong>, client state is
						local to the component that needs it. Moving the data layer to Postgres didn't change
						this — it just made "server state" a real database query instead of an in-memory
						array lookup.
								</P>

								<div className="grid gap-4 md:grid-cols-2">
						<Decision
							choice="Server Components for data fetching"
							reason="Pages fetch their own data directly via lib/data.ts functions, which now call Prisma under the hood. No useEffect, no loading spinner, no client-side fetch. The data is ready when the HTML arrives. This is the App Router's main advantage and the pattern I most wanted to practice here."
						/>
						<Decision
							choice="useState for dialog and form step state"
							reason="Booking dialog open/close and the multi-step wizard state are ephemeral — they don't need to survive navigation or be shared across the component tree. Local useState is the right tool."
						/>
						<Decision
							choice="React Hook Form + Zod for the appointment form"
								reason="The AppointmentForm component uses RHF with a Zod resolver. This keeps validation logic centralized in the schema, makes error messages declarative, and avoids manual onChange handlers for every field."
						/>
						<Decision
							choice="NextAuth session via useSession / auth()"
							reason="The user's identity (name, email, role) is the only piece of state that is truly global. NextAuth handles this via a JWT session — useSession() in Client Components, auth() in Server Components. No manual Context was needed."
							tradeOff="Using the beta NextAuth v5 means some APIs are still shifting. Fine for a learning project, but worth noting. Users are still a hardcoded credentials list rather than rows in the new database — migrating auth to query Postgres directly is the next piece of this puzzle."
						/>
					</div>
							</Section>

							<Section id="auth" title="Auth & Role Model" kicker="Access Model">
								<P>
						The app uses NextAuth v5 with a Credentials provider and a hardcoded set of test
						users. The session stores the user&apos;s role alongside the standard fields via a
						TypeScript augmentation of <code>next-auth.d.ts</code>. Auth hasn&apos;t been migrated
						to the new database yet — that&apos;s intentionally the next piece of work now that
						the data layer runs on Postgres.
								</P>
								<Subsection title="Role-based routing">
									<P>
							There are five roles: <code>admin</code>, <code>staff</code>, <code>doctor</code>,
							<code>patient</code>, <code>receptionist</code>. Patients are redirected to
							<code>/patient-dashboard</code>; all other roles get the full staff interface
							(dashboard, appointments, calendar, patients). The check happens at the page level —
							a simple <code>if (role === &quot;patient&quot;) redirect(...)</code> — rather than
							in middleware. This is explicit and easy to follow during code review.
									</P>
								</Subsection>
								<Subsection title="Why Credentials over OAuth">
									<P>
							The test users need predefined roles. OAuth providers don&apos;t give you a role
							field out of the box. Credentials let me seed the exact accounts I need for
							demonstrating each perspective of the app without external dependencies — and once
							auth moves to the database, the same provider will simply validate against a
							<code>prisma.user.findUnique()</code> lookup instead of a hardcoded array.
									</P>
								</Subsection>
							</Section>

							<Section id="data" title="Data Layer" kicker="Implementation Detail">
								<P>
						Data now lives in PostgreSQL and is accessed through Prisma, using the
						<code>@prisma/adapter-pg</code> driver adapter over the <code>pg</code> driver. The{" "}
						<code>lib/data.ts</code> file still exposes the same named query functions it always
						did (<code>getPatients</code>, <code>getAppointments</code>,{" "}
						<code>getDashboardStats</code>, etc.) — only their implementation changed, from
						filtering in-memory arrays to running Prisma queries. Pages and components didn&apos;t
						need to change at all.
								</P>
								<Subsection title="From in-memory to Postgres">
									<P>
							The project started with data generated once at module load time by Faker.js and
							stored in module-scope arrays, which was enough to prototype UI architecture, auth
							flows, and routing without running a server. Once those patterns were solid, the
							natural next step was swapping that store for a real database — Prisma schema,
							migrations, and a <code>prisma/seed.ts</code> script that uses Faker.js to generate
							the same realistic relational data (appointments still reference patient and doctor
							foreign keys) but writes it into Postgres instead of memory.
									</P>
								</Subsection>
								<Subsection title="AppointmentDetails: join at the data layer">
									<P>
							Rather than passing raw IDs to components and looking up names in the template,
							<code>AppointmentDetails</code> extends <code>Appointment</code> with the full{" "}
							<code>Patient</code> and <code>Doctor</code> objects. With Prisma this join happens
							via <code>include</code> in the query itself, so components still receive the
							complete shape they need and never reach back into the data layer.
									</P>
								</Subsection>
							</Section>

							<Section id="stack" title="Tech Stack Decisions" kicker="Tooling">
								<div className="grid gap-4 md:grid-cols-2">
						<Decision
							choice="Next.js App Router (not Pages Router)"
							reason="App Router was specifically chosen to practice Server Components, route groups, and the new layout conventions. All patterns here are App Router-first."
						/>
						<Decision
							choice="Tailwind CSS v4"
							reason="v4 drops the config file in favor of CSS-first configuration. I wanted to learn the new mental model. The utility-first approach also keeps all styles co-located with the markup, which works well with Server Components (no CSS-in-JS hydration issues)."
						/>
						<Decision
							choice="TypeScript strict mode"
							reason="Strict mode throughout. Types are defined in lib/types.ts and imported everywhere. The next-auth session shape is augmented via declaration merging so user.role is always typed correctly."
						/>
						<Decision
							choice="Zod for validation"
							reason="Zod schemas live in lib/validations/ and are used both server-side (API route handler for tasks) and client-side (React Hook Form resolver). One schema, two uses."
						/>
						<Decision
							choice="Prisma + PostgreSQL with the pg driver adapter"
							reason="Prisma's schema-first workflow and generated client kept lib/data.ts's function signatures unchanged during the swap from in-memory arrays. The @prisma/adapter-pg driver adapter runs on the standard node-postgres driver rather than Prisma's own query engine binary, which keeps the deployment story simpler."
							tradeOff="Local development now depends on a running Postgres instance (via Docker) instead of just npm run dev — one more moving part than the in-memory version, in exchange for real persistence and relational integrity."
						/>
						<Decision
							choice="Geist as the app font"
							reason="Geist (Vercel's open-source font) is optimized for developer-tool UIs and works well with the clinical, data-dense aesthetic I was going for."
						/>
						<Decision
							choice="Lucide React for icons"
							reason="Consistent icon set, tree-shakeable, matches the neutral visual tone. No icon font weight penalty."
						/>
					</div>
							</Section>

							<Section id="lessons" title="Lessons & Next Steps" kicker="Reflection">
								<div className="grid gap-5 xl:grid-cols-2">
									<Subsection title="What worked well">
										<ul className="space-y-3 text-slate-700 leading-7 list-disc list-inside">
							<li>
								Server Components made data-fetching remarkably clean — pages are just async
								functions that read data and return JSX, both before and after the database swap.
							</li>
							<li>
								The two-layer component model (primitives vs. feature components) kept the{" "}
								<code>components/ui/</code> folder stable while feature components changed
								frequently.
							</li>
							<li>
								Keeping state local (no global store) removed a whole class of over-engineering
								decisions. The app never needed it.
							</li>
							<li>
								Typing the NextAuth session once in <code>next-auth.d.ts</code> paid off
								everywhere — <code>session.user.role</code> is typed throughout.
							</li>
							<li>
								Shaping <code>lib/data.ts</code> as a repository layer from the start meant
								replacing Faker&apos;s in-memory arrays with Prisma queries against Postgres
								required no changes to types, pages, or components — exactly as planned.
							</li>
						</ul>
									</Subsection>
									<Subsection title="What's next">
										<ul className="space-y-3 text-slate-700 leading-7 list-disc list-inside">
							<li>
								Migrate auth to the database — swap the hardcoded test users in{" "}
								<code>auth.ts</code> for a <code>prisma.user.findUnique()</code> lookup with
								hashed password comparison.
							</li>
							<li>
								Add API route handlers for client-side mutation flows (
								<code>POST /api/appointments</code>, etc.) now that there&apos;s a real database
								to write to.
							</li>
							<li>
								Add optimistic updates for booking/cancellation flows using React&apos;s{" "}
								<code>useOptimistic</code> hook once those mutation routes exist.
							</li>
							<li>
								Extract the multi-step wizard into a generic hook so it can be reused for other
								flows (e.g., patient registration).
							</li>
							<li>
								Add end-to-end tests with Playwright to lock in the role-redirect behaviour that
								is easy to accidentally break.
							</li>
						</ul>
									</Subsection>
								</div>
							</Section>
						</div>
					</div>

					<aside className="lg:sticky lg:top-24 lg:self-start">
						<div className="space-y-4">
							<SidebarCard title="Reading Guide">
								<p className="text-sm leading-6 text-slate-600">
									This page is organized from broad framing to implementation detail. Hiring teams
									can stay with the summary and lessons; engineers can follow each decision section.
								</p>
							</SidebarCard>
							<SidebarCard title="Sections">
								<nav className="space-y-1">
									{sections.map((section, index) => (
										<a
											key={section.id}
											href={`#${section.id}`}
											className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
										>
											<span>{section.label}</span>
											<span aria-hidden="true" className="text-slate-400">
												{String(index + 1).padStart(2, "0")}
											</span>
										</a>
									))}
								</nav>
							</SidebarCard>
							<SidebarCard title="Project Signal">
								<ul className="space-y-3 text-sm leading-6 text-slate-600">
									<li>Clear role modeling across multiple user types.</li>
									<li>Strong separation of page concerns, feature concerns, and UI primitives.</li>
									<li>Pragmatic trade-offs, revisited and resolved as the project matured — in-memory data became a real Postgres database once the UI patterns were solid.</li>
								</ul>
							</SidebarCard>
						</div>
					</aside>
				</section>

				<footer className="mt-12 border-t border-slate-200/80 pt-8 text-sm text-slate-500">
					Built by Veronique Colleret · MediSchedule learning project · {new Date().getFullYear()}
				</footer>
			</main>
		</div>
	);
}