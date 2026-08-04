import { z } from "zod";

export const patientStatusSchema = z.enum(["active", "new", "inactive"]);

export const patientSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	dob: z.string().min(1),
	email: z.email(),
	phone: z.string().min(1),
	status: patientStatusSchema,
});

export const doctorSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	specialty: z.string().min(1),
	avatar: z.string().min(1),
});

export const appointmentStatusSchema = z.enum(["confirmed", "pending", "cancelled"]);

export const appointmentSchema = z.object({
	id: z.string().min(1),
	patientId: z.string().min(1),
	doctorId: z.string().min(1),
	date: z.iso.date(),
	time: z.iso.time({ precision: -1 }),
	status: appointmentStatusSchema,
	type: z.string().min(1),
	reason: z.string().min(1),
});

export const userRoleSchema = z.enum(["admin", "staff", "doctor", "patient", "receptionist"]);

export const authUserSchema = z.object({
	id: z.string().min(1),
	email: z.email(),
	name: z.string().min(1),
	role: userRoleSchema,
});

export const appointmentDetailsSchema = appointmentSchema.extend({
	patient: patientSchema,
	doctor: doctorSchema,
});
