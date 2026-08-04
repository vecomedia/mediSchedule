import type { AppointmentDetails, AppointmentStatus } from "@/lib/types";
import {
	OFFICE_END_HOUR,
	OFFICE_SLOT_MINUTES,
	OFFICE_START_HOUR,
} from "@/lib/office-hours";

export const START_HOUR = OFFICE_START_HOUR;
export const END_HOUR = OFFICE_END_HOUR;
export const SLOT_MINUTES = OFFICE_SLOT_MINUTES;
export const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;

export type CalendarView = "week" | "day";
export type StatusFilter = "all" | AppointmentStatus;

export type CalendarAppointment = AppointmentDetails & {
	startAt: Date;
	endAt: Date;
	dayKey: string;
	startSlot: number;
	endSlot: number;
	overlapIndex: number;
	overlapCount: number;
	displayStartTime: string;
	displayEndTime: string;
};

export function toDateTime(date: string, time: string) {
	return new Date(`${date}T${time}:00`);
}

export function addDays(value: Date, days: number) {
	const next = new Date(value);
	next.setDate(next.getDate() + days);
	return next;
}

export function startOfWeek(value: Date) {
	const next = new Date(value);
	next.setHours(0, 0, 0, 0);
	next.setDate(next.getDate() - next.getDay());
	return next;
}

export function startOfDay(value: Date) {
	const next = new Date(value);
	next.setHours(0, 0, 0, 0);
	return next;
}

export function isSameDay(left: Date, right: Date) {
	return (
		left.getFullYear() === right.getFullYear() &&
		left.getMonth() === right.getMonth() &&
		left.getDate() === right.getDate()
	);
}

export function toDayKey(value: Date) {
	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const day = String(value.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function estimateDurationInMinutes(reason: string) {
	const normalized = reason.toLowerCase();

	if (normalized.includes("annual") || normalized.includes("physical")) {
		return 60;
	}

	if (normalized.includes("consultation") || normalized.includes("specialist")) {
		return 45;
	}

	if (normalized.includes("lab") || normalized.includes("vaccination")) {
		return 15;
	}

	return 30;
}

function toDisplayTime(value: Date) {
	return value.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
}

function getSlotIndex(value: Date) {
	const minutesFromDayStart = value.getHours() * 60 + value.getMinutes();
	const gridStartMinutes = START_HOUR * 60;
	return Math.floor((minutesFromDayStart - gridStartMinutes) / SLOT_MINUTES);
}

function withOverlapData(appointments: CalendarAppointment[]) {
	const byDayAndSlot = new Map<string, CalendarAppointment[]>();

	for (const appointment of appointments) {
		const key = `${appointment.dayKey}-${appointment.startSlot}`;
		const list = byDayAndSlot.get(key) ?? [];
		list.push(appointment);
		byDayAndSlot.set(key, list);
	}

	for (const list of byDayAndSlot.values()) {
		list.sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
		const overlapCount = list.length;

		list.forEach((appointment, index) => {
			appointment.overlapIndex = index;
			appointment.overlapCount = overlapCount;
		});
	}

	return appointments;
}

export function buildCalendarAppointments(source: AppointmentDetails[]) {
	const mapped = source
		.map<CalendarAppointment | null>((appointment) => {
			const startAt = toDateTime(appointment.date, appointment.time);
			const duration = estimateDurationInMinutes(appointment.reason);
			const endAt = new Date(startAt.getTime() + duration * 60 * 1000);
			const startSlot = getSlotIndex(startAt);

			if (startSlot < 0 || startSlot >= TOTAL_SLOTS) {
				return null;
			}

			const slotSpan = Math.max(1, Math.ceil(duration / SLOT_MINUTES));
			const endSlot = Math.min(TOTAL_SLOTS, startSlot + slotSpan);

			return {
				...appointment,
				startAt,
				endAt,
				dayKey: toDayKey(startAt),
				startSlot,
				endSlot,
				overlapIndex: 0,
				overlapCount: 1,
				displayStartTime: toDisplayTime(startAt),
				displayEndTime: toDisplayTime(endAt),
			};
		})
		.filter((appointment): appointment is CalendarAppointment => appointment !== null)
		.sort((left, right) => left.startAt.getTime() - right.startAt.getTime());

	return withOverlapData(mapped);
}

export function slotLabel(slotIndex: number) {
	const totalMinutes = START_HOUR * 60 + slotIndex * SLOT_MINUTES;
	const hour24 = Math.floor(totalMinutes / 60);
	const minute = totalMinutes % 60;
	const period = hour24 >= 12 ? "PM" : "AM";
	const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
	return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function statusText(status: AppointmentStatus) {
	if (status === "confirmed") return "Confirmed";
	if (status === "pending") return "Pending";
	return "Cancelled";
}
