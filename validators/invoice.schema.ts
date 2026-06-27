import { z } from "zod";
import { INVOICE_STATUSES, PAYMENT_METHODS } from "@/types/invoice";

export const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);

export const createInvoiceSchema = z
  .object({
    booking_id: z.coerce.number().int().positive().optional(),
    group_id: z.coerce.number().int().positive().optional(),
    advance_paid: z.coerce
      .number()
      .min(0, "Advance payment cannot be negative")
      .optional(),
    notes: z
      .union([z.literal(""), z.string().trim()])
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .refine(
    (data) =>
      (data.booking_id != null && data.group_id == null) ||
      (data.booking_id == null && data.group_id != null),
    { message: "Provide either booking_id or group_id" }
  );

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  payment_method: paymentMethodSchema.default("cash"),
  reference: z
    .union([z.literal(""), z.string().trim()])
    .optional()
    .transform((value) => (value ? value : undefined)),
  notes: z
    .union([z.literal(""), z.string().trim()])
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentSchema = z.infer<typeof recordPaymentSchema>;
