"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { Doctor, Patient } from "@/lib/types";

import AppointmentBookingDialog, { type AppointmentData } from "./AppointmentBookingDialog";
import { Button } from "./ui/button";

type StaffBookingDialogProps = {
  patients: Patient[];
  doctors: Doctor[];
  onSubmit?: (appointment: AppointmentData) => void;
  triggerLabel?: string;
  triggerClassName?: string;
};

const defaultTriggerClassName = "bg-blue-600 hover:bg-blue-700 text-white";

export default function StaffBookingDialog({
  patients,
  doctors,
  onSubmit,
  triggerLabel = "New Appointment",
  triggerClassName = defaultTriggerClassName,
}: StaffBookingDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className={triggerClassName} onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        {triggerLabel}
      </Button>

      <AppointmentBookingDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
        patients={patients}
        doctors={doctors}
      />
    </>
  );
}