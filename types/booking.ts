import type { Customer } from "@/types/customer";
import type { RoomType } from "@/types/roomType";

export type BookingStatus =
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export interface Booking {
  id: number;
  booking_no: string;
  customer_id: number | null;
  group_id?: number | null;
  room_type_id: number;
  check_in: string;
  check_out: string;
  nights: number;
  rate_per_night: number;
  total_bill: number;
  advance_paid: number;
  due_amount: number;
  status: BookingStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type BookingWithRelations = Booking & {
  customers?: Pick<Customer, "id" | "name" | "mobile"> | null;
  room_types?: Pick<RoomType, "id" | "name" | "rate_per_night" | "total_rooms"> | null;
};

export type CreateBookingInput = {
  booking_no: string;
  customer_id?: number | null;
  group_id?: number | null;
  room_type_id: number;
  check_in: string;
  check_out: string;
  nights: number;
  rate_per_night: number;
  total_bill: number;
  advance_paid: number;
  due_amount: number;
  status: BookingStatus;
  notes?: string | null;
};

export type UpdateBookingInput = CreateBookingInput;

export const BOOKING_STATUSES: BookingStatus[] = [
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "#3b82f6",
  checked_in: "#22c55e",
  checked_out: "#64748b",
  cancelled: "#ef4444",
};
