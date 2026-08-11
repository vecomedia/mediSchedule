"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { officeTimeToUtc, utcToOfficeParts } from "@/lib/office-hours";
import type { AppointmentDetails, Doctor, Patient } from "@/lib/types";

import AppointmentBookingDialog, { type AppointmentData } from "./AppointmentBookingDialog";
import { Button } from "./ui/button";


type StaffBookingDialogProps = {
  patients: Patient[];
  doctors: Doctor[];
  onSubmit?: (appointment: AppointmentData) => void;
  onAppointmentCreated?: (appointment: AppointmentDetails) => void;
  triggerLabel?: string;
  triggerClassName?: string;
};

const defaultTriggerClassName = "bg-blue-600 hover:bg-blue-700 text-white";

export default function StaffBookingDialog({
  patients,
  doctors,
  onSubmit,
  onAppointmentCreated,
  triggerLabel = "New Appointment",
  triggerClassName = defaultTriggerClassName,
}: StaffBookingDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSubmit(appointment: AppointmentData) {
    if (onSubmit) {
      await onSubmit(appointment);
      return;
    }

    const startAt = officeTimeToUtc(appointment.date, appointment.time);
    const endAt = new Date(startAt.getTime() + Number(appointment.duration) * 60 * 1000);

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        type: appointment.type,
        reason: appointment.notes.trim() || appointment.type,
        notes: appointment.notes.trim() || undefined,
        status: "PENDING",
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Unable to save appointment.");
    }

    const payload = (await response.json()) as {
      appointment: {
        id: string;
        patientId: string;
        doctorId: string;
        startAt: string;
        status: "PENDING" | "CONFIRMED" | "CANCELLED";
        type: string;
        reason: string;
      };
    };

    const patient = patients.find((entry) => entry.id === appointment.patientId);
    const doctor = doctors.find((entry) => entry.id === appointment.doctorId);

    if (patient && doctor) {
		const { date, time } = utcToOfficeParts(payload.appointment.startAt);
      onAppointmentCreated?.({
        id: payload.appointment.id,
        patientId: payload.appointment.patientId,
        doctorId: payload.appointment.doctorId,
       	date,
		time,
        status: payload.appointment.status.toLowerCase() as AppointmentDetails["status"],
        type: payload.appointment.type,
        reason: payload.appointment.reason,
        patient,
        doctor,
      });
    }

    if (!onAppointmentCreated) {
      router.refresh();
    }
  }

  return (
    <>
      <Button className={triggerClassName} onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        {triggerLabel}
      </Button>

      <AppointmentBookingDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        patients={patients}
        doctors={doctors}
      />
    </>
  );
}