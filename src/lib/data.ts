import { AppointmentStatus as PrismaStatus } from "@prisma/client";
import type { Doctor as PrismaDoctor, PatientProfile, User } from "@prisma/client";

import { appointments, doctors, patients } from "./faker-data";
import { prisma } from "./prisma";
import type { AppointmentDetails, AppointmentStatus, Doctor, Patient, PatientStatus } from "./types";
import { officeTimeToUtc, utcToOfficeParts } from "./office-hours";


// ---------------------------------------------------------------------------
// Mappers: Prisma records → app domain types
// ---------------------------------------------------------------------------

type PrismaPatientWithUser = PatientProfile & { user: User };

type PrismaDoctorRecord = PrismaDoctor;

type PrismaAppointmentWithRelations = Awaited<
	ReturnType<typeof prisma.appointment.findFirst<{
		include: {
			patient: { include: { user: true } };
			doctor: true;
		};
	}>>
>;

function mapDoctor(doctor: PrismaDoctorRecord): Doctor {
	return {
		id: doctor.id,
		name: doctor.name,
		specialty: doctor.specialty,
		avatar: doctor.avatar ?? "",
	};
}

function mapPatient(profile: PrismaPatientWithUser): Patient {
	return {
		id: profile.id,
		name: profile.user.name,
		dob: profile.dateOfBirth?.toISOString() ?? new Date(0).toISOString(),
		email: profile.user.email,
		phone: profile.user.phone ?? "",
		status: profile.status as PatientStatus,
	};
}

function mapStatus(status: PrismaStatus): AppointmentStatus {
	return status.toLowerCase() as AppointmentStatus;
}


function mapAppointmentDetails(
  apt: NonNullable<PrismaAppointmentWithRelations>,
): AppointmentDetails {
  const { date, time } = utcToOfficeParts(apt.startAt.toISOString());

  return {
    id: apt.id,
    patientId: apt.patientId,
    doctorId: apt.doctorId,
    date,
    time,
    status: mapStatus(apt.status),
    type: apt.type,
    reason: apt.reason,
    patient: mapPatient(apt.patient),
    doctor: mapDoctor(apt.doctor),
  };
}

function toPrismaStatus(status: AppointmentStatus): PrismaStatus {
	return status.toUpperCase() as PrismaStatus;
}

let hasWarnedAboutFallback = false;
let prismaAvailable: boolean | null = null;

function isPrismaConnectionError(error: unknown) {
	if (!(error instanceof Error)) {
		return false;
	}

	return (
		error.name === "PrismaClientInitializationError" ||
		error.message.includes("Can't reach database server") ||
		error.message.includes("Environment variable not found: DATABASE_URL")
	);
}

function warnAboutDevFallback(error: unknown) {
	if (process.env.NODE_ENV === "production" || hasWarnedAboutFallback) {
		return;
	}

	hasWarnedAboutFallback = true;
	console.warn(
		"[data] Falling back to seeded faker data because Prisma is unavailable in development.",
		error,
	);
}

async function shouldUsePrisma() {
	if (process.env.NODE_ENV === "production") {
		return true;
	}

	// Cache only successful connections so development can recover
	// automatically after PostgreSQL starts later.
	if (prismaAvailable === true) {
		return prismaAvailable;
	}

	try {
		await prisma.$connect();
		prismaAvailable = true;
		return true;
	} catch (error) {
		if (!isPrismaConnectionError(error)) {
			throw error;
		}

		prismaAvailable = false;
		warnAboutDevFallback(error);
		return false;
	}
}

function byDateAndTime(left: AppointmentDetails, right: AppointmentDetails) {
	return `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`);
}

function hydrateFallbackAppointment(appointmentId: string) {
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

function getFallbackPatients(search?: string): Patient[] {
	const query = search?.trim().toLowerCase();

	if (!query) {
		return [...patients].sort((left, right) => left.name.localeCompare(right.name));
	}

	return patients
		.filter(
			(patient) =>
				patient.name.toLowerCase().includes(query) ||
				patient.email.toLowerCase().includes(query) ||
				patient.phone.toLowerCase().includes(query),
		)
		.sort((left, right) => left.name.localeCompare(right.name));
}

function getFallbackDoctors(): Doctor[] {
	return [...doctors].sort((left, right) => left.name.localeCompare(right.name));
}

function getFallbackAppointments(options?: {
	date?: string;
	status?: AppointmentStatus | "all";
	limit?: number;
	patientUserId?: string;
}) {
	const filtered = appointments
		.map((appointment) => hydrateFallbackAppointment(appointment.id))
		.filter((appointment): appointment is AppointmentDetails => Boolean(appointment))
		.filter((appointment) => !options?.date || appointment.date === options.date)
		.filter(
			(appointment) =>
				!options?.status || options.status === "all" || appointment.status === options.status,
		)
		.sort(byDateAndTime);

	if (options?.limit) {
		return filtered.slice(0, options.limit);
	}

	return filtered;
}

function getFallbackDashboardStats(today: string) {
	const allAppointments = getFallbackAppointments();

	return {
		totalPatients: patients.length,
		todayAppointments: allAppointments.filter((appointment) => appointment.date === today).length,
		pendingAppointments: allAppointments.filter((appointment) => appointment.status === "pending").length,
		upcomingAppointments: allAppointments
			.filter((appointment) => `${appointment.date}T${appointment.time}` >= `${today}T00:00`)
			.slice(0, 6),
	};
}

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

export async function getPatients(search?: string): Promise<Patient[]> {
	if (!(await shouldUsePrisma())) {
		return getFallbackPatients(search);
	}

	try {
		const query = search?.trim();

		const records = await prisma.patientProfile.findMany({
			where: query
				? {
						user: {
							OR: [
								{ name: { contains: query, mode: "insensitive" } },
								{ email: { contains: query, mode: "insensitive" } },
								{ phone: { contains: query, mode: "insensitive" } },
							],
						},
					}
				: undefined,
			include: { user: true },
			orderBy: { user: { name: "asc" } },
		});

		return records.map(mapPatient);
	} catch (error) {
		if (!isPrismaConnectionError(error) || process.env.NODE_ENV === "production") {
			throw error;
		}

		warnAboutDevFallback(error);
		return getFallbackPatients(search);
	}
}

export async function getDoctors(): Promise<Doctor[]> {
	if (!(await shouldUsePrisma())) {
		return getFallbackDoctors();
	}

	try {
		const records = await prisma.doctor.findMany({
			orderBy: { name: "asc" },
		});

		return records.map(mapDoctor);
	} catch (error) {
		if (!isPrismaConnectionError(error) || process.env.NODE_ENV === "production") {
			throw error;
		}

		warnAboutDevFallback(error);
		return getFallbackDoctors();
	}
}

export async function getAppointments(options?: {
	date?: string;
	status?: AppointmentStatus | "all";
	limit?: number;
	patientUserId?: string;
	patientUserEmail?: string;
}): Promise<AppointmentDetails[]> {
	if (!(await shouldUsePrisma())) {
		return getFallbackAppointments(options);
	}

	try {
		const dateFilter =
			options?.date
				? {
						gte: officeTimeToUtc(options.date, "00:00"),
       					 lt: officeTimeToUtc(options.date, "23:59"),
					}
				: undefined;

		const statusFilter =
			options?.status && options.status !== "all"
				? toPrismaStatus(options.status)
				: undefined;

		const records = await prisma.appointment.findMany({
			where: {
				...(dateFilter ? { startAt: dateFilter } : {}),
				...(statusFilter ? { status: statusFilter } : {}),
				...((options?.patientUserId || options?.patientUserEmail)
					? {
						patient: {
							OR: [
								...(options?.patientUserId
									? [{ userId: options.patientUserId }]
									: []),
								...(options?.patientUserEmail
									? [{ user: { email: options.patientUserEmail } }]
									: []),
							],
						},
					}
					: {}),
			},
			include: {
				patient: { include: { user: true } },
				doctor: true,
			},
			orderBy: { startAt: "asc" },
			...(options?.limit ? { take: options.limit } : {}),
		});

		return records.map(mapAppointmentDetails);
	} catch (error) {
		if (!isPrismaConnectionError(error) || process.env.NODE_ENV === "production") {
			throw error;
		}

		warnAboutDevFallback(error);
		return getFallbackAppointments(options);
	}
}

export async function getAppointmentById(
	appointmentId: string,
): Promise<AppointmentDetails | null> {
	if (!(await shouldUsePrisma())) {
		return hydrateFallbackAppointment(appointmentId);
	}

	try {
		const apt = await prisma.appointment.findUnique({
			where: { id: appointmentId },
			include: {
				patient: { include: { user: true } },
				doctor: true,
			},
		});

		if (!apt) return null;

		return mapAppointmentDetails(apt);
	} catch (error) {
		if (!isPrismaConnectionError(error) || process.env.NODE_ENV === "production") {
			throw error;
		}

		warnAboutDevFallback(error);
		return hydrateFallbackAppointment(appointmentId);
	}
}

export async function getDashboardStats(today: string) {
    if (!(await shouldUsePrisma())) {
        return getFallbackDashboardStats(today);
    }

    try {
        const todayStart = officeTimeToUtc(today, "00:00");
        const todayEnd = officeTimeToUtc(today, "23:59");

        const [totalPatients, todayAppointments, pendingAppointments, upcomingAppointments] =
            await Promise.all([
                prisma.patientProfile.count(),
                prisma.appointment.count({
                    where: {
                        startAt: {
                            gte: todayStart,
                            lt: todayEnd,
                        },
                    },
                }),
                prisma.appointment.count({
                    where: { status: PrismaStatus.PENDING },
                }),
                prisma.appointment.findMany({
                    where: {
                        startAt: { gte: todayStart },
                    },
                    include: {
                        patient: { include: { user: true } },
                        doctor: true,
                    },
                    orderBy: { startAt: "asc" },
                    take: 6,
                }),
            ]);

		return {
			totalPatients,
			todayAppointments,
			pendingAppointments,
			upcomingAppointments: upcomingAppointments.map(mapAppointmentDetails),
		};
	} catch (error) {
		if (!isPrismaConnectionError(error) || process.env.NODE_ENV === "production") {
			throw error;
		}

		warnAboutDevFallback(error);
		return getFallbackDashboardStats(today);
	}
}