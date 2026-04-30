import { z } from "zod";

export const appointmentFormSchema = z.object({
	patientId: z.string().min(1, "Select a patient."),
	doctorId: z.string().min(1, "Select a doctor."),
	date: z.string().min(1, "Choose a date."),
	time: z.string().min(1, "Choose a time."),
	reason: z.string().min(3, "Add a short appointment reason."),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;