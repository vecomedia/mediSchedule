import { z } from "zod";

export const appointmentFormSchema = z.object({
	patientId: z.string().min(1, "Select a patient."),
	doctorId: z.string().min(1, "Select a doctor."),
	date: z.string().min(1, "Choose a date."),
	time: z.string().min(1, "Choose a time."),
	reason: z.string().min(3, "Add a short appointment reason."),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Schema for the multi-step booking dialog wizard
export const bookingDialogSchema = z.object({
	patientId: z.string().min(1, "Select a patient."),
	patientName: z.string().min(1),
	doctorId: z.string().min(1, "Select a doctor."),
	doctorName: z.string().min(1),
	date: z.string().min(1, "Choose a date."),
	time: z.string().min(1, "Choose a time."),
	duration: z.string().min(1),
	type: z.string().min(1, "Select an appointment type."),
	notes: z.string().default(""),
});

export type BookingDialogValues = z.infer<typeof bookingDialogSchema>;