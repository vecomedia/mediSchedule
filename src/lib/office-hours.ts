export const OFFICE_START_HOUR = 7;
export const OFFICE_END_HOUR = 17;
export const OFFICE_SLOT_MINUTES = 15;

function toMinutes(hour: number, minute: number) {
  return hour * 60 + minute;
}

/**
 * Converts a Date to ISO datetime string with timezone offset
 * Required by validation schemas that expect z.iso.datetime({ offset: true })
 * e.g., "2026-06-20T14:00:00+02:00"
 */
export function toISOWithOffset(date: Date): string {
  const offset = date.getTimezoneOffset();
  const absOffset = Math.abs(offset);
  const sign = offset <= 0 ? "+" : "-";
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const offsetMinutes = String(absOffset % 60).padStart(2, "0");

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  const millisecond = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}${sign}${offsetHours}:${offsetMinutes}`;
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
