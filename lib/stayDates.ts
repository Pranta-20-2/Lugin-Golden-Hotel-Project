export const CHECK_IN_HOUR = 16;
export const CHECK_OUT_HOUR = 14;

export const STAY_TIME_POLICY_HINT =
  "Check-in at 4:00 PM · Check-out at 2:00 PM (local time)";

const stayDateTimeFormat: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

export function parseLocalDate(dateStr: string): Date {
  const datePart = dateStr.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date(NaN);
  }

  return new Date(year, month - 1, day);
}

export function withCheckInTime(dateStr: string): Date {
  const date = parseLocalDate(dateStr);
  date.setHours(CHECK_IN_HOUR, 0, 0, 0);
  return date;
}

export function withCheckOutTime(dateStr: string): Date {
  const date = parseLocalDate(dateStr);
  date.setHours(CHECK_OUT_HOUR, 0, 0, 0);
  return date;
}

export function isValidStayRange(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;
  return withCheckOutTime(checkOut).getTime() > withCheckInTime(checkIn).getTime();
}

export function formatCheckInDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = withCheckInTime(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, stayDateTimeFormat);
}

export function formatCheckOutDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = withCheckOutTime(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, stayDateTimeFormat);
}

export function formatStayRange(
  checkIn?: string | null,
  checkOut?: string | null
): string {
  if (!checkIn || !checkOut) return "—";
  return `${formatCheckInDateTime(checkIn)} → ${formatCheckOutDateTime(checkOut)}`;
}
