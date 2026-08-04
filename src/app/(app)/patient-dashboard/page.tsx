import { redirect } from "next/navigation";

import { auth } from "@/auth";
import PatientDashboard from "@/app/components/PatientDashboard";
import { getAppointments, getDoctors } from "@/lib/data";

export default async function PatientDashboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role !== "patient") {
		redirect("/dashboard");
	}

	const appointments = await getAppointments({
		patientUserId: session.user.id,
		patientUserEmail: session.user.email ?? undefined,
	});
	const doctors = await getDoctors();

	return <PatientDashboard appointments={appointments} doctors={doctors} />;
}