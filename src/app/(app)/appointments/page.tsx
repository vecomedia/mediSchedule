import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { StatusBadge } from "@/app/components/ui/status-badge";
import StaffBookingDialog from "@/app/components/StaffBookingDialog";
import { AppointmentActionButtons } from "@/app/components/appointment-action-buttons";
import { getAppointments, getDoctors, getPatients } from "@/lib/data";
import type { AppointmentStatus } from "@/lib/types";

type AppointmentSearchParams = {
	date?: string;
	status?: AppointmentStatus | "all";
};

export default async function AppointmentsPage({
	searchParams,
}: {
	searchParams: Promise<AppointmentSearchParams>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role === "patient") {
		redirect("/patient-dashboard");
	}

	const params = await searchParams;
	const [doctors, patients, appointments] = await Promise.all([
		getDoctors(),
		getPatients(),
		getAppointments({
			date: params.date,
			status: params.status,
		}),
	]);

	const calendarSearchParams = new URLSearchParams();

	if (params.date) {
		calendarSearchParams.set("date", params.date);
		calendarSearchParams.set("view", "day");
	}

	if (params.status && params.status !== "all") {
		calendarSearchParams.set("status", params.status);
	}

	const calendarHref = calendarSearchParams.size
		? `/calendar?${calendarSearchParams.toString()}`
		: "/calendar";

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="flex flex-row items-start justify-between">
					<div>
						<CardTitle>Appointments</CardTitle>
						<CardDescription>Filter the deterministic schedule by date or workflow status.</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Link
							href={calendarHref}
							className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
						>
							Open in calendar
						</Link>
						<StaffBookingDialog patients={patients} doctors={doctors} />
					</div>
				</CardHeader>
				<CardContent>
					<form className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_220px_auto]">
						<label className="space-y-2 text-sm font-medium text-slate-700">
							<span>Date</span>
							<input
								name="date"
								type="date"
								defaultValue={params.date}
								className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
							/>
						</label>
						<label className="space-y-2 text-sm font-medium text-slate-700">
							<span>Status</span>
							<select
								name="status"
								defaultValue={params.status ?? "all"}
								className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
							>
								<option value="all">All statuses</option>
								<option value="confirmed">Confirmed</option>
								<option value="pending">Pending</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</label>
						<button className="h-10 self-end rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700" type="submit">
							Apply filters
						</button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="overflow-hidden p-0">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 text-sm">
							<thead className="bg-slate-50 text-left text-slate-500">
								<tr>
									<th className="px-6 py-4 font-medium">Patient</th>
									<th className="px-6 py-4 font-medium">Doctor</th>
									<th className="px-6 py-4 font-medium">Date</th>
									<th className="px-6 py-4 font-medium">Reason</th>
									<th className="px-6 py-4 font-medium">Status</th>
									<th className="px-6 py-4 font-medium">Actions</th>
									<th className="px-6 py-4 font-medium">Calendar</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 bg-white">
								{appointments.map((appointment) => (
									<tr key={appointment.id}>
										<td className="px-6 py-4 font-medium text-slate-900">{appointment.patient.name}</td>
										<td className="px-6 py-4 text-slate-600">{appointment.doctor.name}</td>
										<td className="px-6 py-4 text-slate-600">{appointment.date} at {appointment.time}</td>
										<td className="px-6 py-4 text-slate-600">{appointment.reason}</td>
										<td className="px-6 py-4"><StatusBadge status={appointment.status} /></td>
										<td className="px-6 py-4">
											<AppointmentActionButtons
												appointmentId={appointment.id}
												currentStatus={appointment.status}
											/>
										</td>
										<td className="px-6 py-4">
											<Link
												href={`/calendar?date=${appointment.date}&status=${appointment.status}&view=day`}
												className="text-sm font-medium text-blue-700 hover:text-blue-800"
											>
												View
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}