import { z } from "zod";

import { isOfficeSlotAligned, isWithinOfficeHours } from "@/lib/office-hours";

export const createAppointmentSchema = z
  .object({
    patientId: z.string().min(1, "Patient is required."),
    doctorId: z.string().min(1, "Doctor is required."),
    startAt: z.iso.datetime({ offset: true }),
    endAt: z.iso.datetime({ offset: true }),
    type: z.string().min(1, "Appointment type is required."),
    reason: z.string().min(3, "Reason must be at least 3 characters."),
    notes: z.string().max(1000).optional(),
    status: z.enum(["PENDING", "CONFIRMED"]).optional(),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startAt);
    const end = new Date(value.endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid appointment datetime." });
      return;
    }

    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "Appointment endAt must be after startAt.",
        path: ["endAt"],
      });
    }

    if (!isOfficeSlotAligned(start) || !isOfficeSlotAligned(end)) {
      ctx.addIssue({
        code: "custom",
        message: "Appointment times must align to office 30-minute slots.",
      });
    }

    if (!isWithinOfficeHours(start, end)) {
      ctx.addIssue({
        code: "custom",
        message: "Appointment must be within office hours.",
      });
    }
  });

export const rescheduleAppointmentSchema = z
  .object({
    startAt: z.iso.datetime({ offset: true }),
    endAt: z.iso.datetime({ offset: true }),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startAt);
    const end = new Date(value.endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid appointment datetime." });
      return;
    }

    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "Appointment endAt must be after startAt.",
        path: ["endAt"],
      });
    }

    if (!isOfficeSlotAligned(start) || !isOfficeSlotAligned(end)) {
      ctx.addIssue({
        code: "custom",
        message: "Appointment times must align to office 30-minute slots.",
      });
    }

    if (!isWithinOfficeHours(start, end)) {
      ctx.addIssue({
        code: "custom",
        message: "Appointment must be within office hours.",
      });
    }
  });

export const updateAppointmentSchema = z.object({
  type: z.string().min(1).optional(),
  reason: z.string().min(3).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(3, "Cancellation reason is required."),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
