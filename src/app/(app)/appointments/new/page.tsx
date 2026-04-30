import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AppointmentForm } from "@/app/components/appointment-form";
import { getDoctors, getPatients } from "@/lib/data";

export default async function NewAppointmentPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role === "patient") {
		redirect("/patient-dashboard");
	}

	const doctors = getDoctors();
	const patients = getPatients();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Book a new appointment</CardTitle>
				<CardDescription>
					Use the seeded patient and doctor lists to validate a typical scheduling flow.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<AppointmentForm doctors={doctors} patients={patients} />
			</CardContent>
		</Card>
	);
}