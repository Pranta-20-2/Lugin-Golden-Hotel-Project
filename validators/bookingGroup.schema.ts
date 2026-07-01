import { z } from "zod";
import { isValidStayRange } from "@/lib/stayDates";
import { bookingStatusSchema } from "@/validators/booking.schema";
import { customerFieldsSchema } from "@/validators/customer.schema";

const optionalText = z
  .union([z.literal(""), z.string().trim()])
  .optional()
  .transform((value) => (value ? value : undefined));

const roomTypeLineSchema = z.object({
  room_type_id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const bookingGroupSchema = z
  .object({
    group_name: z.string().trim().min(1, "Group name is required"),
    customer: customerFieldsSchema,
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Check-out date is required"),
    status: bookingStatusSchema,
    notes: optionalText,
    advance_paid: z.coerce
      .number()
      .min(0, "Advance paid cannot be negative")
      .optional(),
    room_type_lines: z
      .array(roomTypeLineSchema)
      .min(1, "Select at least one room type"),
  })
  .refine((data) => isValidStayRange(data.check_in, data.check_out), {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

export type BookingGroupFormSchema = z.infer<typeof bookingGroupSchema>;

function toNullable(value: string | undefined) {
  return value ?? null;
}

export function toBookingGroupFormRecord(data: BookingGroupFormSchema) {
  return {
    group_name: data.group_name,
    contact_person: data.customer.name,
    mobile: data.customer.mobile,
    customer: data.customer,
    check_in: data.check_in,
    check_out: data.check_out,
    status: data.status,
    notes: toNullable(data.notes),
    advance_paid: data.advance_paid ?? 0,
    room_type_lines: data.room_type_lines,
  };
}

export function flattenRoomTypeLines(
  lines: Array<{ room_type_id: number; quantity: number }>
): number[] {
  const roomTypeIds: number[] = [];
  for (const line of lines) {
    for (let index = 0; index < line.quantity; index++) {
      roomTypeIds.push(line.room_type_id);
    }
  }
  return roomTypeIds;
}

export function groupBookingsToLines(
  bookings: Array<{ room_type_id: number }>
): Array<{ room_type_id: number; quantity: number }> {
  const counts = new Map<number, number>();
  for (const booking of bookings) {
    counts.set(
      booking.room_type_id,
      (counts.get(booking.room_type_id) ?? 0) + 1
    );
  }
  return [...counts.entries()].map(([room_type_id, quantity]) => ({
    room_type_id,
    quantity,
  }));
}
