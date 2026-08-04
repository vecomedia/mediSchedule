import { z } from "zod";

import {
	appointmentDetailsSchema,
	appointmentSchema,
	appointmentStatusSchema,
	authUserSchema,
	doctorSchema,
	patientSchema,
	patientStatusSchema,
	userRoleSchema,
} from "@/lib/schemas/domain";

export type PatientStatus = z.infer<typeof patientStatusSchema>;
export type Patient = z.infer<typeof patientSchema>;

export type Doctor = z.infer<typeof doctorSchema>;

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;

export type UserRole = z.infer<typeof userRoleSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;

export type AppointmentDetails = z.infer<typeof appointmentDetailsSchema>;