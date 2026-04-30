"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import type { Doctor, Patient } from "@/lib/types";
import {
	appointmentFormSchema,
	type AppointmentFormValues,
} from "@/lib/validations/appointment";

type AppointmentFormProps = {
	doctors: Doctor[];
	patients: Patient[];
};

export function AppointmentForm({ doctors, patients }: AppointmentFormProps) {
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const form = useForm<AppointmentFormValues>({
		resolver: zodResolver(appointmentFormSchema),
		defaultValues: {
			patientId: patients[0]?.id ?? "",
			doctorId: doctors[0]?.id ?? "",
			date: "2026-04-27",
			time: "09:30",
			reason: "Routine check-up",
		},
	});

	const onSubmit = form.handleSubmit((values) => {
		const patient = patients.find((entry) => entry.id === values.patientId);
		const doctor = doctors.find((entry) => entry.id === values.doctorId);

		setSuccessMessage(
			`Draft booking saved for ${patient?.name ?? "the selected patient"} with ${doctor?.name ?? "the selected doctor"} on ${values.date} at ${values.time}.`,
		);
	});

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			{successMessage ? (
				<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
					{successMessage}
				</div>
			) : null}

			<div className="grid gap-5 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="patientId">Patient</Label>
					<select
						id="patientId"
						className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
						{...form.register("patientId")}
					>
						{patients.map((patient) => (
							<option key={patient.id} value={patient.id}>
								{patient.name}
							</option>
						))}
					</select>
					{form.formState.errors.patientId ? (
						<p className="text-sm text-red-600">{form.formState.errors.patientId.message}</p>
					) : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="doctorId">Doctor</Label>
					<select
						id="doctorId"
						className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
						{...form.register("doctorId")}
					>
						{doctors.map((doctor) => (
							<option key={doctor.id} value={doctor.id}>
								{doctor.name} - {doctor.specialty}
							</option>
						))}
					</select>
					{form.formState.errors.doctorId ? (
						<p className="text-sm text-red-600">{form.formState.errors.doctorId.message}</p>
					) : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="date">Date</Label>
					<Input id="date" type="date" {...form.register("date")} />
					{form.formState.errors.date ? (
						<p className="text-sm text-red-600">{form.formState.errors.date.message}</p>
					) : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="time">Time</Label>
					<Input id="time" type="time" {...form.register("time")} />
					{form.formState.errors.time ? (
						<p className="text-sm text-red-600">{form.formState.errors.time.message}</p>
					) : null}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="reason">Reason</Label>
				<Input id="reason" placeholder="Follow-up consultation" {...form.register("reason")} />
				{form.formState.errors.reason ? (
					<p className="text-sm text-red-600">{form.formState.errors.reason.message}</p>
				) : null}
			</div>

			<Button type="submit">Save appointment draft</Button>
		</form>
	);
}