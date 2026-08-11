export const OFFICE_START_HOUR = 7;
export const OFFICE_END_HOUR = 17;
export const OFFICE_SLOT_MINUTES = 15;
export const OFFICE_TIMEZONE = "Europe/Berlin";

function toMinutes(hour: number, minute: number) {
  return hour * 60 + minute;
}


function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

export function officeTimeToUtc(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  // First guess, treating the wall-clock time as if it were UTC
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Find out how far OFFICE_TIMEZONE actually is from UTC at that date (handles DST)
  const offsetMinutes = getTimeZoneOffsetMinutes(naiveUtc, OFFICE_TIMEZONE);

  // Correct it — this is the true UTC instant for "09:00 at the office"
  return new Date(naiveUtc.getTime() - offsetMinutes * 60000);
}


export function buildOfficeTimeSlots() {
  const slotCount = ((OFFICE_END_HOUR - OFFICE_START_HOUR) * 60) / OFFICE_SLOT_MINUTES;

  return Array.from({ length: slotCount }, (_, index) => {
    const totalMinutes = OFFICE_START_HOUR * 60 + index * OFFICE_SLOT_MINUTES;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  });
}

export function formatOfficeTimeLabel(value: string) {
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function isOfficeSlotAligned(value: Date) {
  return (
    value.getMinutes() % OFFICE_SLOT_MINUTES === 0 &&
    value.getSeconds() === 0 &&
    value.getMilliseconds() === 0
  );
}

export function isWithinOfficeHours(startAt: Date, endAt: Date) {
  if (startAt.toDateString() !== endAt.toDateString()) {
    return false;
  }

  const startMinutes = toMinutes(startAt.getHours(), startAt.getMinutes());
  const endMinutes = toMinutes(endAt.getHours(), endAt.getMinutes());
  const officeStartMinutes = toMinutes(OFFICE_START_HOUR, 0);
  const officeEndMinutes = toMinutes(OFFICE_END_HOUR, 0);

  return startMinutes >= officeStartMinutes && endMinutes <= officeEndMinutes;
}


export function utcToOfficeParts(isoString: string): { date: string; time: string } {
  const date = new Date(isoString);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: OFFICE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}