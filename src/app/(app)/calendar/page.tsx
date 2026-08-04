import { redirect } from "next/navigation";

import { auth } from "@/auth";
import CalendarClient from "@/app/components/calendar/calendar-client";
import { getAppointments, getDoctors, getPatients } from "@/lib/data";
import type { AppointmentStatus } from "@/lib/types";

type CalendarSearchParams = {
	date?: string;
	status?: AppointmentStatus | "all";
	view?: "day" | "week";
};

export default async function CalendarPage({
	searchParams,
}: {
	searchParams: Promise<CalendarSearchParams>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role === "patient") {
		redirect("/patient-dashboard");
	}

	const params = await searchParams;

	const [appointments, doctors, patients] = await Promise.all([
		getAppointments(),
		getDoctors(),
		getPatients(),
	]);

	return (
		<CalendarClient
			appointments={appointments}
			doctors={doctors}
			patients={patients}
			initialDate={params.date}
			initialStatus={params.status}
			initialView={params.view}
		/>
	);
}