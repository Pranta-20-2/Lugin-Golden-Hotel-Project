import type { RoomWithType } from "@/types/room";
import { BOOKING_STATUS_LABELS } from "@/types/booking";
import { isActiveBookingStatus } from "@/lib/bookingRoomStatusSync";
import { ROOM_STATUS_LABELS } from "@/types/room";

export type RoomSelectState = "available" | "booked" | "maintenance" | "selected";

export function getRoomSelectState(
  room: RoomWithType,
  options: {
    selectedRoomIds: number[];
    excludeGroupId?: number;
  }
): RoomSelectState {
  if (options.selectedRoomIds.includes(room.id)) {
    return "selected";
  }

  if (room.status === "maintenance") {
    return "maintenance";
  }

  if (
    room.booking_status &&
    isActiveBookingStatus(room.booking_status) &&
    !(
      options.excludeGroupId != null &&
      room.active_booking_group_id === options.excludeGroupId
    )
  ) {
    return "booked";
  }

  return "available";
}

export function canSelectRoomForGroup(
  room: RoomWithType,
  options: {
    selectedRoomIds: number[];
    excludeGroupId?: number;
  }
): boolean {
  const state = getRoomSelectState(room, options);
  return state === "available" || state === "selected";
}

export function canSelectRoomForBooking(
  room: RoomWithType,
  options?: { currentRoomId?: number }
): boolean {
  if (options?.currentRoomId === room.id) {
    return true;
  }

  if (room.status === "maintenance") {
    return false;
  }

  if (room.booking_status && isActiveBookingStatus(room.booking_status)) {
    return false;
  }

  return true;
}

export function formatRoomSelectLabel(
  room: RoomWithType,
  selectable: boolean
): string {
  const base = `${room.room_number} — ${room.room_types?.name ?? "Unassigned"}`;

  if (selectable) {
    return base;
  }

  if (room.status === "maintenance") {
    return `${base} (${ROOM_STATUS_LABELS.maintenance})`;
  }

  if (room.booking_status && isActiveBookingStatus(room.booking_status)) {
    return `${base} (Booked — ${BOOKING_STATUS_LABELS[room.booking_status]})`;
  }

  return `${base} (Unavailable)`;
}

export function sortRoomsForSelect(
  rooms: RoomWithType[],
  isSelectable: (room: RoomWithType) => boolean
): RoomWithType[] {
  return [...rooms].sort((a, b) => {
    const aSelectable = isSelectable(a);
    const bSelectable = isSelectable(b);
    if (aSelectable !== bSelectable) {
      return aSelectable ? -1 : 1;
    }
    return a.room_number.localeCompare(b.room_number, undefined, {
      numeric: true,
    });
  });
}

export function getRoomSelectHint(state: RoomSelectState): string | null {
  switch (state) {
    case "booked":
      return "Already booked — not available";
    case "maintenance":
      return "Under maintenance — not available";
    default:
      return null;
  }
}
