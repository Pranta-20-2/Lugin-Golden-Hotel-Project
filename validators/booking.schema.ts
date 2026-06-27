import { z } from "zod";
import { BOOKING_STATUSES } from "@/types/booking";
import { customerFieldsSchema } from "@/validators/customer.schema";

const optionalText = z
  .union([z.literal(""), z.string().trim()])
  .optional()
  .transform((value) => (value ? value : undefined));

export const bookingStatusSchema = z.enum(BOOKING_STATUSES);

const bookingCoreSchema = z.object({
  room_type_id: z.coerce
    .number()
    .int("Room type is required")
    .positive("Room type is required"),
  check_in: z.string().min(1, "Check-in date is required"),
  check_out: z.string().min(1, "Check-out date is required"),
  advance_paid: z.coerce
    .number()
    .min(0, "Advance paid cannot be negative")
    .optional(),
  status: bookingStatusSchema,
  notes: optionalText,
});

const bookingWithExistingCustomerSchema = bookingCoreSchema.extend({
  customer_mode: z.literal("existing"),
  customer_id: z.coerce
    .number()
    .int("Customer is required")
    .positive("Customer is required"),
});

const bookingWithNewCustomerSchema = bookingCoreSchema.extend({
  customer_mode: z.literal("new"),
  customer: customerFieldsSchema,
});

export const bookingSchema = z
  .discriminatedUnion("customer_mode", [
    bookingWithExistingCustomerSchema,
    bookingWithNewCustomerSchema,
  ])
  .refine((data) => new Date(data.check_out) > new Date(data.check_in), {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

export type BookingFormSchema = z.infer<typeof bookingSchema>;
