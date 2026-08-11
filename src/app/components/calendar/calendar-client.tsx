"use client";

import { useMemo, useOptimistic, useState, startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AppointmentDetailsDialog } from "@/app/components/AppointmentDetailsDialog";
import StaffBookingDialog from "@/app/components/StaffBookingDialog";
import { Button } from "@/app/components/ui/button";
import type { AppointmentDetails, AppointmentStatus, Doctor, Patient } from "@/lib/types";
import { cn } from "@/lib/utils";


import { AppointmentCard } from "./appointment-card";
import { DayGrid } from "./day-grid";
import { WeekGrid } from "./week-grid";
import {
	addDays,
	buildCalendarAppointments,
	isSameDay,
	startOfDay,
	startOfWeek,
	toDayKey,
	type CalendarAppointment,
	type CalendarView,
	type StatusFilter,
} from "./calendar-utils";

type CalendarClientProps = {
	appointments: AppointmentDetails[];
	doctors: Doctor[];
	patients: Patient[];
	initialDate?: string;
	initialStatus?: StatusFilter;
	initialView?: CalendarView;
};

function isValidDateParam(value: string | undefined) {
	if (!value) {
		return false;
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function resolveInitialStatus(value: StatusFilter | undefined): StatusFilter {
	if (value === "confirmed" || value === "pending" || value === "cancelled" || value === "all") {
		return value;
	}

	return "all";
}

function dateRangeLabel(view: CalendarView, currentDate: Date) {
	if (view === "day") {
		return currentDate.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}

	const weekStart = startOfWeek(currentDate);
	const weekEnd = addDays(weekStart, 6);

	return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function toApiStatus(status: AppointmentStatus): "CONFIRMED" | "CANCELLED" {
	return status === "confirmed" ? "CONFIRMED" : "CANCELLED";
}

export default function CalendarClient({
	appointments,
	doctors,
	patients,
	initialDate,
	initialStatus,
	initialView,
}: CalendarClientProps) {
	const router = useRouter();
	const safeInitialDate = isValidDateParam(initialDate)
		? new Date(`${initialDate}T00:00:00`)
		: new Date();

	const [view, setView] = useState<CalendarView>(initialView === "day" ? "day" : "week");
	const [currentDate, setCurrentDate] = useState<Date>(safeInitialDate);
	const [doctorFilter, setDoctorFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>(resolveInitialStatus(initialStatus));
	const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

	const handleSelectAppointment = (id: string | null) => {
		if (id !== selectedAppointmentId) {
			setReschedulingAppointmentId(null);
			setRescheduleError(null);
		}
		setSelectedAppointmentId(id);
	};

	const handleRescheduleFromCard = (appointmentId: string) => {
		logRescheduleDebug("Reschedule button clicked on card", {
			appointmentId,
			selectedAppointmentId,
		});
		const appointment = allCalendarAppointments.find((a) => a.id === appointmentId);
		if (!appointment) {
			logRescheduleDebug("Appointment not found in allCalendarAppointments", {
				appointmentId,
				availableAppointmentIds: allCalendarAppointments.map((a) => a.id),
			});
			return;
		}
		setSelectedAppointmentId(appointmentId);
		openReschedule(appointment);
	};
	const [actionError, setActionError] = useState<string | null>(null);
	const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
	const [baseAppointments, setBaseAppointments] = useState<AppointmentDetails[]>(appointments);
	const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState<string | null>(null);
	const [rescheduleDate, setRescheduleDate] = useState("");
	const [rescheduleTime, setRescheduleTime] = useState("");
	const [rescheduleError, setRescheduleError] = useState<string | null>(null);
	const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);

	// Open/close details dialog based on selected appointment
	useEffect(() => {
		setAppointmentDetailsOpen(selectedAppointmentId !== null);
	}, [selectedAppointmentId]);

	const [optimisticAppointments, addOptimisticStatus] = useOptimistic(
		baseAppointments,
		(currentAppointments, input: { appointmentId: string; status: AppointmentStatus }) =>
			currentAppointments.map((appointment) =>
				appointment.id === input.appointmentId
					? {
							...appointment,
							status: input.status,
						}
					: appointment,
			),
	);

	const allCalendarAppointments = useMemo(
		() => buildCalendarAppointments(optimisticAppointments),
		[optimisticAppointments],
	);

	const logRescheduleDebug = (...args: unknown[]) => {
		console.log("[calendar:reschedule]", ...args);
	};

	const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
	const weekDates = useMemo(
		() => Array.from({ length: 7 }, (_, dayOffset) => addDays(weekStart, dayOffset)),
		[weekStart],
	);

	const visibleAppointments = useMemo(() => {
		return allCalendarAppointments.filter((appointment) => {
			const matchesDoctor = doctorFilter === "all" || appointment.doctorId === doctorFilter;
			const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

			if (!matchesDoctor || !matchesStatus) {
				return false;
			}

			if (view === "day") {
				return isSameDay(appointment.startAt, currentDate);
			}

			return weekDates.some((day) => isSameDay(day, appointment.startAt));
		});
	}, [allCalendarAppointments, currentDate, doctorFilter, statusFilter, view, weekDates]);

	const selectedAppointment = useMemo(
		() =>
			allCalendarAppointments.find((appointment) => appointment.id === selectedAppointmentId) ??
			null,
		[allCalendarAppointments, selectedAppointmentId],
	);

	const mobileGroups = useMemo(() => {
		const grouped = new Map<string, CalendarAppointment[]>();

		for (const appointment of visibleAppointments) {
			const key = toDayKey(appointment.startAt);
			const list = grouped.get(key) ?? [];
			list.push(appointment);
			grouped.set(key, list);
		}

		for (const list of grouped.values()) {
			list.sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
		}

		if (view === "day") {
			const key = toDayKey(startOfDay(currentDate));
			return [{ key, date: startOfDay(currentDate), appointments: grouped.get(key) ?? [] }];
		}

		return weekDates.map((date) => {
			const key = toDayKey(date);
			return { key, date, appointments: grouped.get(key) ?? [] };
		});
	}, [currentDate, view, visibleAppointments, weekDates]);

	const handlePrev = () => {
		setCurrentDate((previous) => addDays(previous, view === "day" ? -1 : -7));
	};

	const handleNext = () => {
		setCurrentDate((previous) => addDays(previous, view === "day" ? 1 : 7));
	};

	const handleStatusChange = async (appointmentId: string, nextStatus: AppointmentStatus) => {
		const previousAppointments = baseAppointments;
		setActionError(null);
		setUpdatingAppointmentId(appointmentId);
		startTransition(() => {
			addOptimisticStatus({ appointmentId, status: nextStatus });
		});

		try {
			const response = await fetch(`/api/appointments/${appointmentId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: toApiStatus(nextStatus) }),
			});

			if (!response.ok) {
				throw new Error("Unable to update appointment status.");
			}

			setBaseAppointments((currentAppointments) =>
				currentAppointments.map((appointment) =>
					appointment.id === appointmentId ? { ...appointment, status: nextStatus } : appointment,
				),
			);

			router.refresh();
		} catch {
			setBaseAppointments(previousAppointments);
			setActionError("Status update failed. Please try again.");
		} finally {
			setUpdatingAppointmentId(null);
		}
	};

	const openReschedule = (appointment: CalendarAppointment) => {
		logRescheduleDebug("Opening reschedule form", {
			appointmentId: appointment.id,
			date: appointment.date,
			time: appointment.time,
		});
		setRescheduleDate(appointment.date);
		setRescheduleTime(appointment.time);
		setRescheduleError(null);
		setReschedulingAppointmentId(appointment.id);
	};

	const handleReschedule = async (appointmentId: string) => {
		logRescheduleDebug("Save reschedule clicked", {
			appointmentId,
			rescheduleDate,
			rescheduleTime,
		});
		if (!rescheduleDate || !rescheduleTime) {
			setRescheduleError("Please select a date and time.");
			logRescheduleDebug("Reschedule blocked: missing date or time", {
				appointmentId,
				rescheduleDate,
				rescheduleTime,
			});
			return;
		}

		const previousAppointments = baseAppointments;
		setRescheduleError(null);
		setUpdatingAppointmentId(appointmentId);

		const startAt = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
		const existing = baseAppointments.find((a) => a.id === appointmentId);
		const durationMs = 30 * 60 * 1000; // 30 minutes
		const endAt = new Date(startAt.getTime() + durationMs);
		const requestPayload = {
			mode: "reschedule",
			startAt: startAt.toISOString(),
			endAt: endAt.toISOString(),
		};
		logRescheduleDebug("Sending PATCH /api/appointments/:id", {
			appointmentId,
			payload: requestPayload,
		});

		// Optimistic update
		setBaseAppointments((current) =>
			current.map((a) =>
				a.id === appointmentId
					? { ...a, date: rescheduleDate, time: rescheduleTime }
					: a,
			),
		);
		setReschedulingAppointmentId(null);

		try {
			const response = await fetch(`/api/appointments/${appointmentId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestPayload),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { error?: string } | null;
				logRescheduleDebug("PATCH failed", {
					appointmentId,
					status: response.status,
					payload,
				});
				throw new Error(payload?.error ?? "Unable to reschedule appointment.");
			}

			logRescheduleDebug("PATCH succeeded", {
				appointmentId,
				status: response.status,
			});

			router.refresh();
		} catch (err) {
			logRescheduleDebug("Reschedule error caught", {
				appointmentId,
				error: err instanceof Error ? err.message : err,
			});
			setBaseAppointments(previousAppointments);
			setReschedulingAppointmentId(appointmentId);
			setRescheduleError(err instanceof Error ? err.message : "Unable to reschedule appointment.");
		} finally {
			setUpdatingAppointmentId(null);
		}
	};

	const handleAppointmentCreated = (appointment: AppointmentDetails) => {
		setBaseAppointments((currentAppointments) => {
			const alreadyExists = currentAppointments.some((entry) => entry.id === appointment.id);

			if (alreadyExists) {
				return currentAppointments;
			}

			return [...currentAppointments, appointment].sort((left, right) =>
				`${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`),
			);
		});
		setSelectedAppointmentId(appointment.id);
	};

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
				<div>
					<h1 className="text-3xl font-semibold text-slate-900">Calendar</h1>
					<p className="text-sm text-slate-600">Week and day scheduling for staff, doctors, and reception.</p>
				</div>
				<StaffBookingDialog
					patients={patients}
					doctors={doctors}
					onAppointmentCreated={handleAppointmentCreated}
				/>
			</div>

			<div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" size="sm" onClick={handlePrev}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="min-w-[210px] text-sm font-semibold text-slate-900">{dateRangeLabel(view, currentDate)}</div>
					<Button variant="outline" size="sm" onClick={handleNext}>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
						Today
					</Button>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<div className="rounded-lg border border-slate-200 p-1">
						<Button
							size="sm"
							variant={view === "week" ? "default" : "ghost"}
							onClick={() => setView("week")}
						>
							Week
						</Button>
						<Button
							size="sm"
							variant={view === "day" ? "default" : "ghost"}
							onClick={() => setView("day")}
						>
							Day
						</Button>
					</div>
					<select
						value={doctorFilter}
						onChange={(event) => setDoctorFilter(event.target.value)}
						className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
					>
						<option value="all">All doctors</option>
						{doctors.map((doctor) => (
							<option key={doctor.id} value={doctor.id}>
								Dr. {doctor.name}
							</option>
						))}
					</select>
					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
						className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
					>
						<option value="all">All statuses</option>
						<option value="pending">Pending</option>
						<option value="confirmed">Confirmed</option>
						<option value="cancelled">Cancelled</option>
					</select>
				</div>
			</div>

			<div className="rounded-xl border border-slate-200 bg-white p-3">
				<div className="flex flex-wrap items-center gap-4 text-sm">
					<div className="flex items-center gap-2">
						<span className="h-3 w-3 rounded-full bg-amber-400" />
						<span className="text-slate-600">Pending</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-3 w-3 rounded-full bg-emerald-500" />
						<span className="text-slate-600">Confirmed</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="h-3 w-3 rounded-full bg-slate-400" />
						<span className="text-slate-600">Cancelled</span>
					</div>
				</div>
			</div>

			{actionError ? (
				<p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionError}</p>
			) : null}

			<div className="space-y-4 md:hidden">
				{mobileGroups.map((group) => (
					<section key={group.key} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
						<h2 className="text-sm font-semibold text-slate-900">
							{group.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
						</h2>
						{group.appointments.length === 0 ? (
							<p className="text-sm text-slate-500">No appointments</p>
						) : (
							<div className="space-y-2">
								{group.appointments.map((appointment) => (
									<div key={`mobile-${appointment.id}`} className="min-h-28">
										<AppointmentCard
											appointment={appointment}
											isSelected={selectedAppointmentId === appointment.id}
											isUpdating={updatingAppointmentId === appointment.id}
											onSelect={handleSelectAppointment}
											onStatusChange={handleStatusChange}
											onReschedule={handleRescheduleFromCard}
										/>
									</div>
								))}
							</div>
						)}
					</section>
				))}
			</div>

			<div className="hidden md:block">
				{view === "week" ? (
					<WeekGrid
						weekDates={weekDates}
						appointments={visibleAppointments}
						selectedAppointmentId={selectedAppointmentId}
						updatingAppointmentId={updatingAppointmentId}
						onSelectAppointment={handleSelectAppointment}
						onStatusChange={handleStatusChange}
						onReschedule={handleRescheduleFromCard}
					/>
				) : (
					<DayGrid
						date={currentDate}
						appointments={visibleAppointments}
						selectedAppointmentId={selectedAppointmentId}
						updatingAppointmentId={updatingAppointmentId}
						onSelectAppointment={handleSelectAppointment}
						onStatusChange={handleStatusChange}
						onReschedule={handleRescheduleFromCard}
					/>
				)}
			</div>

			<AppointmentDetailsDialog
				open={appointmentDetailsOpen}
				onOpenChange={(open) => {
					setAppointmentDetailsOpen(open);
					if (!open) {
						setSelectedAppointmentId(null);
						setReschedulingAppointmentId(null);
					}
				}}
				appointment={selectedAppointment}
				reschedulingAppointmentId={reschedulingAppointmentId}
				rescheduleDate={rescheduleDate}
				rescheduleTime={rescheduleTime}
				rescheduleError={rescheduleError}
				updatingAppointmentId={updatingAppointmentId}
				onStatusChange={handleStatusChange}
				onRescheduleClick={() => {
					if (selectedAppointment) {
						openReschedule(selectedAppointment);
					}
				}}
				onRescheduleClose={() => setReschedulingAppointmentId(null)}
				onRescheduleDateChange={setRescheduleDate}
				onRescheduleTimeChange={setRescheduleTime}
				onRescheduleSave={handleReschedule}
			/>
		</div>
	);
}
