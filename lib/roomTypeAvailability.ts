import type { RoomTypeWithAvailability } from "@/types/roomType";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/types/booking";
import { isActiveBookingStatus } from "@/lib/bookingRoomStatusSync";

export function datesOverlap(
  checkInA: string,
  checkOutA: string,
  checkInB: string,
  checkOutB: string
): boolean {
  return checkInA < checkOutB && checkOutA > checkInB;
}

export function calculateAvailableCount(
  totalRooms: number,
  bookedCount: number
): number {
  return Math.max(0, totalRooms - bookedCount);
}

/** One-night window starting today — used for all Available Today displays. */
export function getTodayAvailabilityRange(): {
  checkIn: string;
  checkOut: string;
} {
  const checkIn = new Date();
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);
  return {
    checkIn: checkIn.toLocaleDateString("en-CA"),
    checkOut: checkOut.toLocaleDateString("en-CA"),
  };
}

export function resolveAvailabilityRange(
  checkIn?: string | null,
  checkOut?: string | null
): { checkIn: string; checkOut: string } {
  if (
    checkIn &&
    checkOut &&
    new Date(checkOut).getTime() > new Date(checkIn).getTime()
  ) {
    return { checkIn, checkOut };
  }
  return getTodayAvailabilityRange();
}

export function formatRoomTypeInventory(
  roomType: Pick<RoomTypeWithAvailability, "total_rooms" | "available_count">
): string {
  return `Total: ${roomType.total_rooms} · Available: ${roomType.available_count}`;
}

export function formatRoomTypeSelectLabel(
  roomType: RoomTypeWithAvailability,
  selectable: boolean
): string {
  const base = `${roomType.name} — ${formatRoomTypeInventory(roomType)}`;
  if (selectable) return base;
  return `${base} (Fully booked)`;
}

export function canSelectRoomType(
  roomType: RoomTypeWithAvailability,
  options?: { currentRoomTypeId?: number }
): boolean {
  if (options?.currentRoomTypeId === roomType.id) {
    return true;
  }
  return roomType.available_count > 0;
}

export function sortRoomTypesForSelect(
  roomTypes: RoomTypeWithAvailability[],
  isSelectable: (roomType: RoomTypeWithAvailability) => boolean
): RoomTypeWithAvailability[] {
  return [...roomTypes].sort((a, b) => {
    const aSelectable = isSelectable(a);
    const bSelectable = isSelectable(b);
    if (aSelectable !== bSelectable) {
      return aSelectable ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function aggregateRoomTypeLines(
  lines: Array<{ room_type_id: number; quantity: number }>
): Map<number, number> {
  const totals = new Map<number, number>();
  for (const line of lines) {
    totals.set(
      line.room_type_id,
      (totals.get(line.room_type_id) ?? 0) + line.quantity
    );
  }
  return totals;
}

export function getBookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status];
}

export function isActiveStatus(status: BookingStatus): boolean {
  return isActiveBookingStatus(status);
}
