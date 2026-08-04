import type { AppointmentStatus } from "@/lib/types";

import { AppointmentCard } from "./appointment-card";
import { slotLabel, TOTAL_SLOTS, type CalendarAppointment } from "./calendar-utils";

type DayGridProps = {
	date: Date;
	appointments: CalendarAppointment[];
	selectedAppointmentId: string | null;
	updatingAppointmentId: string | null;
	onSelectAppointment: (appointmentId: string) => void;
	onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
	onReschedule: (appointmentId: string) => void;
};

export function DayGrid({
	date,
	appointments,
	selectedAppointmentId,
	updatingAppointmentId,
	onSelectAppointment,
	onStatusChange,
	onReschedule,
}: DayGridProps) {
	const bySlot = new Map<number, CalendarAppointment[]>();

	for (const appointment of appointments) {
		const list = bySlot.get(appointment.startSlot) ?? [];
		list.push(appointment);
		bySlot.set(appointment.startSlot, list);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
			<div className="border-b border-slate-200 bg-slate-50 p-3">
				<p className="text-sm font-semibold text-slate-900">
					{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
				</p>
			</div>
			<div className="grid grid-cols-[84px_minmax(0,1fr)]">
				<div className="border-r border-slate-200 bg-slate-50">
					{Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => (
						<div key={`time-${slotIndex}`} className="h-24 border-b border-slate-200 px-2 py-1 text-xs text-slate-500">
							{slotIndex % 2 === 0 ? slotLabel(slotIndex) : ""}
						</div>
					))}
				</div>
				<div>
					{Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => {
						const slotAppointments = bySlot.get(slotIndex) ?? [];

						return (
							<div key={`slot-${slotIndex}`} className="h-24 border-b border-slate-200 p-1 transition-colors hover:bg-slate-50">
								{slotAppointments.length > 0 ? (
									<div className={slotAppointments.length > 1 ? "grid h-full grid-cols-2 gap-1" : "h-full"}>
										{slotAppointments.map((appointment) => (
											<AppointmentCard
												key={appointment.id}
												appointment={appointment}
												isSelected={selectedAppointmentId === appointment.id}
												isUpdating={updatingAppointmentId === appointment.id}
												onSelect={onSelectAppointment}
												onStatusChange={onStatusChange}
												onReschedule={onReschedule}
											/>
										))}
									</div>
								) : null}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
