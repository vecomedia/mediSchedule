import { redirect } from "next/navigation";

import { auth } from "@/auth";
import PatientDashboard from "@/app/components/patient-dashboard";
import { getAppointments } from "@/lib/data";

export default async function PatientDashboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role !== "patient") {
		redirect("/dashboard");
	}

	const appointments = getAppointments();

	return <PatientDashboard appointments={appointments} />;
}