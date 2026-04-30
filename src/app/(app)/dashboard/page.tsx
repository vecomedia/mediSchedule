import { CalendarClock, Clock3, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { getDashboardStats } from "@/lib/data";

function formatDisplayDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

const today = new Date().toISOString().slice(0, 10);

export default async function DashboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role === "patient") {
		redirect("/patient-dashboard");
	}

	const stats = getDashboardStats(today);

	return (
		<div className="p-8 space-y-8">
			<section className="grid gap-5 md:grid-cols-3">
				<Card className="border-blue-100 bg-blue-50/70">
					<CardHeader>
						<CardDescription>Total patients</CardDescription>
						<CardTitle className="flex items-center gap-3 text-4xl">
							<Users className="h-8 w-8 text-blue-600" />
							{stats.totalPatients}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="border-emerald-100 bg-emerald-50/70">
					<CardHeader>
						<CardDescription>Today&apos;s appointments</CardDescription>
						<CardTitle className="flex items-center gap-3 text-4xl">
							<CalendarClock className="h-8 w-8 text-emerald-600" />
							{stats.todayAppointments}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="border-amber-100 bg-amber-50/80">
					<CardHeader>
						<CardDescription>Pending approval</CardDescription>
						<CardTitle className="flex items-center gap-3 text-4xl">
							<Clock3 className="h-8 w-8 text-amber-600" />
							{stats.pendingAppointments}
						</CardTitle>
					</CardHeader>
				</Card>
			</section>

			<section>
				<Card>
					<CardHeader>
						<CardTitle>Upcoming appointments</CardTitle>
						<CardDescription>Seeded faker data gives you a stable planning dataset on every restart.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{stats.upcomingAppointments.map((appointment) => (
							<div
								key={appointment.id}
								className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<p className="text-sm text-slate-500">{formatDisplayDate(appointment.date)} at {appointment.time}</p>
									<p className="mt-1 text-lg font-semibold text-slate-900">{appointment.patient.name}</p>
									<p className="text-sm text-slate-600">{appointment.reason} with {appointment.doctor.name}</p>
								</div>
								<StatusBadge status={appointment.status} />
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}