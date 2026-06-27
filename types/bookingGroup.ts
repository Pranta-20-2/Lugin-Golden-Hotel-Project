import type { Booking, BookingStatus } from "@/types/booking";
import { BOOKING_STATUS_LABELS } from "@/types/booking";
import type { Customer } from "@/types/customer";
import type { RoomType } from "@/types/roomType";

export interface BookingGroup {
  id: number;
  group_name: string;
  customer_id?: number | null;
  contact_person: string;
  mobile: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type RoomTypeLine = {
  room_type_id: number;
  quantity: number;
};

export type CreateBookingGroupInput = {
  group_name: string;
  contact_person: string;
  mobile: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  notes?: string | null;
  room_type_lines: RoomTypeLine[];
  advance_paid?: number;
};

export type UpdateBookingGroupInput = CreateBookingGroupInput;

export type BookingGroupWithRelations = BookingGroup & {
  customers?: Pick<
    Customer,
    "id" | "name" | "mobile" | "email" | "national_id" | "address"
  > | null;
  bookings?: Array<
    Pick<
      Booking,
      | "id"
      | "booking_no"
      | "room_type_id"
      | "nights"
      | "rate_per_night"
      | "total_bill"
      | "advance_paid"
      | "due_amount"
      | "status"
    > & {
      room_types?: Pick<RoomType, "id" | "name"> | null;
    }
  >;
};

export function getBookingGroupTotals(group: BookingGroupWithRelations) {
  const bookings = group.bookings ?? [];
  const totalBill = bookings.reduce(
    (sum, booking) => sum + Number(booking.total_bill ?? 0),
    0
  );
  const advancePaid = bookings.reduce(
    (sum, booking) => sum + Number(booking.advance_paid ?? 0),
    0
  );
  const dueAmount = Math.max(0, totalBill - advancePaid);

  return {
    roomCount: bookings.length,
    nights: bookings[0]?.nights ?? 0,
    totalBill,
    advancePaid,
    dueAmount,
  };
}

export function summarizeGroupRoomTypes(group: BookingGroupWithRelations) {
  const counts = new Map<string, number>();
  for (const booking of group.bookings ?? []) {
    const name = booking.room_types?.name ?? "Unknown";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) =>
    count > 1 ? `${count}× ${name}` : name
  );
}

export { BOOKING_STATUS_LABELS as BOOKING_GROUP_STATUS_LABELS };
