import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

import { statusText, type CalendarAppointment } from "./calendar-utils";

type AppointmentCardProps = {
	appointment: CalendarAppointment;
	isSelected: boolean;
	isUpdating: boolean;
	onSelect: (appointmentId: string) => void;
	onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
	onReschedule: (appointmentId: string) => void;
};

function badgeClass(status: AppointmentStatus) {
	if (status === "confirmed") {
		return "bg-emerald-100 text-emerald-700";
	}

	if (status === "pending") {
		return "bg-amber-100 text-amber-700";
	}

	return "bg-slate-200 text-slate-700";
}

export function AppointmentCard({
	appointment,
	isSelected,
	isUpdating,
	onSelect,
	onStatusChange,
	onReschedule,
}: AppointmentCardProps) {
	return (
		<article
			className={cn(
				"h-full rounded-lg border bg-white p-2 text-xs shadow-sm transition hover:shadow",
				isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200",
			)}
			onClick={() => onSelect(appointment.id)}
		>
			<div className="mb-2 flex items-start justify-between gap-2">
				<div className="min-w-0">
					<p className="truncate font-semibold text-slate-900">{appointment.patient.name}</p>
					<p className="truncate text-slate-600">Dr. {appointment.doctor.name}</p>
				</div>
				<span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", badgeClass(appointment.status))}>
					{statusText(appointment.status)}
				</span>
			</div>

			<p className="mb-1 truncate text-slate-700">Reason: {appointment.reason}</p>
			<p className="mb-1 truncate text-slate-700">Type: {appointment.type}</p>
			<p className="mb-2 text-slate-500">
				{appointment.displayStartTime} - {appointment.displayEndTime}
			</p>

			<div className="flex flex-wrap gap-1" onClick={(event) => event.stopPropagation()}>
				<Button
					size="sm"
					variant="outline"
					disabled={isUpdating || appointment.status === "confirmed"}
					onClick={() => onStatusChange(appointment.id, "confirmed")}
				>
					Confirm
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={isUpdating || appointment.status === "cancelled"}
					onClick={() => onStatusChange(appointment.id, "cancelled")}
				>
					Cancel
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={isUpdating || appointment.status === "cancelled"}
					onClick={() => onReschedule(appointment.id)}
				>
					Reschedule
				</Button>
			</div>
		</article>
	);
}
