export type PatientStatus = "active" | "new" | "inactive";

export interface Patient {
	id: string;
	name: string;
	dob: string;
	email: string;
	phone: string;
	status: PatientStatus;
}

export interface Doctor {
	id: string;
	name: string;
	specialty: string;
	avatar: string;
}

export type AppointmentStatus = "confirmed" | "pending" | "cancelled";

export interface Appointment {
	id: string;
	patientId: string;
	doctorId: string;
	date: string;
	time: string;
	status: AppointmentStatus;
	reason: string;
}

export type UserRole = "admin" | "staff" | "doctor" | "patient" | "receptionist";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	role: UserRole;
}

export interface AppointmentDetails extends Appointment {
	patient: Patient;
	doctor: Doctor;
}