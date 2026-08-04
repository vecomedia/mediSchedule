"use client";

import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import type { AppointmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

import { buildOfficeTimeSlots, formatOfficeTimeLabel } from "@/lib/office-hours";

import { statusText, type CalendarAppointment } from "./calendar/calendar-utils";

type AppointmentDetailsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	appointment: CalendarAppointment | null;
	showConfirmAction?: boolean;
	reschedulingAppointmentId: string | null;
	rescheduleDate: string;
	rescheduleTime: string;
	rescheduleError: string | null;
	updatingAppointmentId: string | null;
	onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
	onRescheduleClick: () => void;
	onRescheduleClose: () => void;
	onRescheduleDateChange: (date: string) => void;
	onRescheduleTimeChange: (time: string) => void;
	onRescheduleSave: (appointmentId: string) => void;
};

function statusBadgeClass(status: AppointmentStatus) {
	if (status === "confirmed") return "bg-emerald-100 text-emerald-700";
	if (status === "pending") return "bg-amber-100 text-amber-700";
	return "bg-slate-200 text-slate-700";
}

function getTodayLocalDate() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function AppointmentDetailsDialog({
	open,
	onOpenChange,
	appointment,
	showConfirmAction = true,
	reschedulingAppointmentId,
	rescheduleDate,
	rescheduleTime,
	rescheduleError,
	updatingAppointmentId,
	onStatusChange,
	onRescheduleClick,
	onRescheduleClose,
	onRescheduleDateChange,
	onRescheduleTimeChange,
	onRescheduleSave,
}: AppointmentDetailsDialogProps) {
	if (!appointment) return null;

	const isRescheduling = reschedulingAppointmentId === appointment.id;
	const officeTimeSlots = buildOfficeTimeSlots();
	const todayLocalDate = getTodayLocalDate();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<div className="space-y-4">
					<div>
						<h2 className="text-lg font-semibold text-slate-900 mb-3">Appointment Details</h2>

						<div className="space-y-2 text-sm">
							<p className="font-medium text-slate-700">
								<span className="font-medium text-slate-700">Patient:</span> {appointment.patient.name}
							</p>
							<p className="font-medium text-slate-700">
								<span className="font-medium text-slate-700">Doctor:</span> Dr. {appointment.doctor.name}
							</p>
							<p className="font-medium text-slate-700">
								<span className="font-medium text-slate-700">Type:</span> {appointment.type}
							</p>
							<p className="font-medium text-slate-700">
								<span className="font-medium text-slate-700">Reason:</span> {appointment.reason}
							</p>
							<p className="font-medium text-slate-700">
								<span className="font-medium text-slate-700">Time:</span> {appointment.displayStartTime} - {appointment.displayEndTime}
							</p>
							<p className="font-medium text-slate-700">
								<span className="font-medium text-slate-700">Status:</span>{" "}
								<span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusBadgeClass(appointment.status))}>
									{statusText(appointment.status)}
								</span>
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
						{showConfirmAction ? (
							<Button
								variant="outline"
								size="sm"
								disabled={updatingAppointmentId === appointment.id || appointment.status === "confirmed"}
								onClick={() => onStatusChange(appointment.id, "confirmed")}
							>
								Confirm
							</Button>
						) : null}
						<Button
							variant="outline"
							size="sm"
							disabled={updatingAppointmentId === appointment.id || appointment.status === "cancelled"}
							onClick={() => onStatusChange(appointment.id, "cancelled")}
						>
							Cancel
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={updatingAppointmentId === appointment.id || appointment.status === "cancelled"}
							onClick={isRescheduling ? onRescheduleClose : onRescheduleClick}
						>
							{isRescheduling ? "Close" : "Reschedule"}
						</Button>
					</div>

					{isRescheduling ? (
						<div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
							<p className="text-xs font-semibold text-slate-700">New date &amp; time</p>
							{rescheduleError ? (
								<div className="rounded-lg bg-rose-50 p-2 border border-rose-200">
									<p className="text-xs font-medium text-rose-700 mb-1">Error:</p>
									<p className="text-xs text-rose-600 whitespace-pre-wrap">{rescheduleError}</p>
								</div>
							) : null}
							<div className="flex flex-col gap-2">
								<input
									type="date"
									value={rescheduleDate}
									min={todayLocalDate}
									onChange={(e) => onRescheduleDateChange(e.target.value)}
									className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
								/>
								<select
									value={rescheduleTime}
									onChange={(e) => onRescheduleTimeChange(e.target.value)}
									className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
								>
									{officeTimeSlots.map((slot) => (
										<option key={slot} value={slot}>
											{formatOfficeTimeLabel(slot)}
										</option>
									))}
								</select>
								<Button
									size="sm"
									disabled={updatingAppointmentId === appointment.id}
									onClick={() => onRescheduleSave(appointment.id)}
									className="w-full"
								>
									{updatingAppointmentId === appointment.id ? "Saving…" : "Save"}
								</Button>
							</div>
						</div>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}
