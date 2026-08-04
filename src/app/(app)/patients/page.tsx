import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { getPatients } from "@/lib/data";

type PatientSearchParams = {
	search?: string;
};

function formatBirthDate(value: string) {
	return new Intl.DateTimeFormat("de-DE", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}

export default async function PatientsPage({
	searchParams,
}: {
	searchParams: Promise<PatientSearchParams>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role === "patient") {
		redirect("/patient-dashboard");
	}

	const params = await searchParams;
	const patients = await getPatients(params.search);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Patients</CardTitle>
					<CardDescription>Search the in-memory patient directory by name, email, or phone.</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<input
							name="search"
							defaultValue={params.search}
							placeholder="Search patients"
							className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
						/>
					</form>
				</CardContent>
			</Card>

			<div className="grid gap-4 xl:grid-cols-2">
				{patients.map((patient) => (
					<Card key={patient.id}>
						<CardContent className="flex flex-col gap-3 p-6">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h3 className="text-lg font-semibold text-slate-900">{patient.name}</h3>
									<p className="text-sm text-slate-500">DOB {formatBirthDate(patient.dob)}</p>
								</div>
								<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
									{patient.status}
								</span>
							</div>
							<div className="space-y-1 text-sm text-slate-600">
								<p>{patient.email}</p>
								<p>{patient.phone}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}