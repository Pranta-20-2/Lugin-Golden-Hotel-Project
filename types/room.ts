import type { RoomType } from "@/types/roomType";
import type { BookingStatus } from "@/types/booking";

export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved";

export interface Room {
  id: number;
  room_number: string;
  room_type_id: number;
  status: RoomStatus;
  created_at?: string;
  updated_at?: string;
}

export type RoomWithType = Room & {
  room_types?: Pick<RoomType, "id" | "name" | "rate_per_night"> | null;
  booking_status?: BookingStatus | null;
  active_booking_group_id?: number | null;
};

export type CreateRoomInput = {
  room_number: string;
  room_type_id: number;
  status: RoomStatus;
};

export type UpdateRoomInput = CreateRoomInput;

export const ROOM_STATUSES: RoomStatus[] = [
  "available",
  "occupied",
  "maintenance",
  "reserved",
];

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Maintenance",
  reserved: "Reserved",
};