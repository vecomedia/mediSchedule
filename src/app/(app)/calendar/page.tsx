import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Calendar from "@/app/components/Calendar";
import { getAppointments, getDoctors, getPatients } from "@/lib/data";

export default async function CalendarPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role === "patient") {
		redirect("/patient-dashboard");
	}

	const appointments = getAppointments();
	const doctors = getDoctors();
	const patients = getPatients();

	return <Calendar appointments={appointments} doctors={doctors} patients={patients} />;
}