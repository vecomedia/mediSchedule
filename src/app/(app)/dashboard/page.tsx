import { CalendarClock, Clock3, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { getAppointments, getDashboardStats } from "@/lib/data";

function formatDisplayDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

function formatDisplayTime(value: string) {
	const [rawHour, rawMinute] = value.split(":");
	const hour = Number(rawHour);
	const period = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 === 0 ? 12 : hour % 12;

	return `${displayHour}:${rawMinute} ${period}`;
}

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

export default async function DashboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role === "patient") {
		redirect("/patient-dashboard");
	}

	const [stats, allAppointments] = await Promise.all([
		getDashboardStats(today),
		getAppointments(),
	]);

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
						{stats.upcomingAppointments.filter((appointment) => appointment.status !== "cancelled").length === 0 ? (
							<p className="text-sm text-slate-500">No upcoming appointments.</p>
						) : stats.upcomingAppointments
							.filter((appointment) => appointment.status !== "cancelled")
							.map((appointment) => (
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

			<section>
				<Card>
					<CardHeader>
						<CardTitle>All appointments</CardTitle>
						<CardDescription>Complete appointment list for staff dashboard visibility.</CardDescription>
					</CardHeader>
					<CardContent className="overflow-hidden p-0">
						{allAppointments.length === 0 ? (
							<p className="px-6 py-8 text-sm text-slate-500">No appointments found.</p>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-slate-200 text-sm">
									<thead className="bg-slate-50 text-left text-slate-500">
										<tr>
											<th className="px-6 py-4 font-medium">Patient</th>
											<th className="px-6 py-4 font-medium">Doctor</th>
											<th className="px-6 py-4 font-medium">Date</th>
											<th className="px-6 py-4 font-medium">Reason</th>
											<th className="px-6 py-4 font-medium">Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 bg-white">
										{allAppointments.map((appointment) => (
											<tr key={appointment.id}>
												<td className="px-6 py-4 font-medium text-slate-900">{appointment.patient.name}</td>
												<td className="px-6 py-4 text-slate-600">{appointment.doctor.name}</td>
												<td className="px-6 py-4 text-slate-600">
													{formatDisplayDate(appointment.date)} at {formatDisplayTime(appointment.time)}
												</td>
												<td className="px-6 py-4 text-slate-600">{appointment.reason}</td>
												<td className="px-6 py-4"><StatusBadge status={appointment.status} /></td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}