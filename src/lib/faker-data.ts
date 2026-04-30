import { faker } from "@faker-js/faker";

import type { Appointment, AppointmentStatus, Doctor, Patient, PatientStatus } from "./types";

const BASE_DATE = new Date("2026-04-27T08:00:00.000Z");
const SPECIALTIES = [
	"General Medicine",
	"Cardiology",
	"Dermatology",
	"Neurology",
	"Pediatrics",
	"Orthopedics",
	"Radiology",
	"ENT",
];

const PATIENT_STATUSES: PatientStatus[] = ["active", "active", "active", "new", "inactive"];
const APPOINTMENT_STATUSES: AppointmentStatus[] = ["confirmed", "confirmed", "pending", "cancelled"];
const APPOINTMENT_REASONS = [
	"Routine check-up",
	"Follow-up consultation",
	"Lab review",
	"Vaccination",
	"Prescription renewal",
	"Specialist referral",
	"Diagnostic review",
];

faker.seed(42);
faker.setDefaultRefDate(BASE_DATE);

export const doctors: Doctor[] = Array.from({ length: 8 }, (_, index) => ({
	id: `doc-${index + 1}`,
	name: `Dr. ${faker.person.fullName()}`,
	specialty: SPECIALTIES[index % SPECIALTIES.length],
	avatar: faker.image.avatar(),
}));

export const patients: Patient[] = Array.from({ length: 20 }, (_, index) => ({
	id: `pat-${index + 1}`,
	name: faker.person.fullName(),
	dob: faker.date.birthdate({ min: 1948, max: 2018, mode: "year" }).toISOString(),
	email: faker.internet.email().toLowerCase(),
	phone: faker.phone.number({ style: "international" }),
	status: faker.helpers.arrayElement(PATIENT_STATUSES),
}));

export const appointments: Appointment[] = Array.from({ length: 50 }, (_, index) => {
	const appointmentDate = faker.date.between({
		from: BASE_DATE,
		to: new Date("2026-05-31T18:00:00.000Z"),
	});
	const patient = faker.helpers.arrayElement(patients);
	const doctor = faker.helpers.arrayElement(doctors);

	return {
		id: `apt-${index + 1}`,
		patientId: patient.id,
		doctorId: doctor.id,
		date: appointmentDate.toISOString().slice(0, 10),
		time: appointmentDate.toISOString().slice(11, 16),
		status: faker.helpers.arrayElement(APPOINTMENT_STATUSES),
		reason: faker.helpers.arrayElement(APPOINTMENT_REASONS),
	};
});