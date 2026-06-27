import type { BookingStatus } from "@/types/booking";
import { BOOKING_STATUSES } from "@/types/booking";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "confirmed",
  "checked_in",
];

export function isActiveBookingStatus(status: BookingStatus): boolean {
  return ACTIVE_BOOKING_STATUSES.includes(status);
}

export function isBookingStatus(value: string): value is BookingStatus {
  return BOOKING_STATUSES.includes(value as BookingStatus);
}
