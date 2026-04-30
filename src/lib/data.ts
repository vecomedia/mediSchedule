import { appointments, doctors, patients } from "./faker-data";
import type { AppointmentDetails, AppointmentStatus, Doctor, Patient } from "./types";

function byDateAndTime(a: AppointmentDetails, b: AppointmentDetails) {
	return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
}

function hydrateAppointment(appointmentId: string) {
	const appointment = appointments.find((entry) => entry.id === appointmentId);

	if (!appointment) {
		return null;
	}

	const patient = patients.find((entry) => entry.id === appointment.patientId);
	const doctor = doctors.find((entry) => entry.id === appointment.doctorId);

	if (!patient || !doctor) {
		return null;
	}

	return {
		...appointment,
		patient,
		doctor,
	};
}

export function getPatients(search?: string): Patient[] {
	const query = search?.trim().toLowerCase();

	if (!query) {
		return [...patients].sort((a, b) => a.name.localeCompare(b.name));
	}

	return patients
		.filter(
			(patient) =>
				patient.name.toLowerCase().includes(query) ||
				patient.email.toLowerCase().includes(query) ||
				patient.phone.toLowerCase().includes(query),
		)
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function getDoctors(): Doctor[] {
	return [...doctors].sort((a, b) => a.name.localeCompare(b.name));
}

export function getAppointments(options?: {
	date?: string;
	status?: AppointmentStatus | "all";
	limit?: number;
}): AppointmentDetails[] {
	const filtered = appointments
		.map((appointment) => hydrateAppointment(appointment.id))
		.filter((appointment): appointment is AppointmentDetails => Boolean(appointment))
		.filter((appointment) => !options?.date || appointment.date === options.date)
		.filter((appointment) => !options?.status || options.status === "all" || appointment.status === options.status)
		.sort(byDateAndTime);

	if (options?.limit) {
		return filtered.slice(0, options.limit);
	}

	return filtered;
}

export function getAppointmentById(appointmentId: string) {
	return hydrateAppointment(appointmentId);
}

export function getDashboardStats(today: string) {
	const allAppointments = getAppointments();
	return {
		totalPatients: patients.length,
		todayAppointments: allAppointments.filter((appointment) => appointment.date === today).length,
		pendingAppointments: allAppointments.filter((appointment) => appointment.status === "pending").length,
		upcomingAppointments: allAppointments.filter((appointment) => `${appointment.date}T${appointment.time}` >= `${today}T00:00`).slice(0, 6),
	};
}