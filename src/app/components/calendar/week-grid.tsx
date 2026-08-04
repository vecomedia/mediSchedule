import type { AppointmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

import { AppointmentCard } from "./appointment-card";
import { slotLabel, toDayKey, TOTAL_SLOTS, type CalendarAppointment } from "./calendar-utils";

type WeekGridProps = {
	weekDates: Date[];
	appointments: CalendarAppointment[];
	selectedAppointmentId: string | null;
	updatingAppointmentId: string | null;
	onSelectAppointment: (appointmentId: string) => void;
	onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
	onReschedule: (appointmentId: string) => void;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeekGrid({
	weekDates,
	appointments,
	selectedAppointmentId,
	updatingAppointmentId,
	onSelectAppointment,
	onStatusChange,
	onReschedule,
}: WeekGridProps) {
	const byDayAndSlot = new Map<string, CalendarAppointment[]>();

	for (const appointment of appointments) {
		const key = `${appointment.dayKey}-${appointment.startSlot}`;
		const list = byDayAndSlot.get(key) ?? [];
		list.push(appointment);
		byDayAndSlot.set(key, list);
	}

	return (
		<div className="overflow-auto rounded-xl border border-slate-200 bg-white">
			<div className="min-w-[1120px]">
				<div className="grid grid-cols-[84px_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50">
					<div className="border-r border-slate-200 p-3 text-xs font-semibold text-slate-600">Time</div>
					{weekDates.map((date, dayIndex) => {
						const today = new Date();
						const isToday = date.toDateString() === today.toDateString();

						return (
							<div key={toDayKey(date)} className="border-r border-slate-200 p-3 text-center last:border-r-0">
								<p className="text-xs text-slate-500">{DAY_NAMES[dayIndex]}</p>
								<p className={cn("text-base font-semibold", isToday ? "text-blue-600" : "text-slate-900")}>
									{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
								</p>
							</div>
						);
					})}
				</div>

				<div className="grid grid-cols-[84px_repeat(7,minmax(0,1fr))]">
					<div className="border-r border-slate-200 bg-slate-50">
						{Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => (
							<div key={`time-${slotIndex}`} className="h-24 border-b border-slate-200 px-2 py-1 text-xs text-slate-500">
								{slotIndex % 2 === 0 ? slotLabel(slotIndex) : ""}
							</div>
						))}
					</div>

					{weekDates.map((date) => {
						const dayKey = toDayKey(date);

						return (
							<div key={`day-${dayKey}`} className="border-r border-slate-200 last:border-r-0">
								{Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => {
									const slotKey = `${dayKey}-${slotIndex}`;
									const slotAppointments = byDayAndSlot.get(slotKey) ?? [];

									return (
										<div
											key={slotKey}
											className="h-24 border-b border-slate-200 p-1 transition-colors hover:bg-slate-50"
										>
											{slotAppointments.length > 0 ? (
												<div className={cn("grid h-full gap-1", slotAppointments.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
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
						);
					})}
				</div>
			</div>
		</div>
	);
}
