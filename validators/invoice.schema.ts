import { z } from "zod";
import { INVOICE_STATUSES } from "@/types/invoice";

export const invoiceStatusSchema = z.enum(INVOICE_STATUSES);

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

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = z.object({
  amount_paid: z.coerce
    .number()
    .min(0, "Amount paid cannot be negative"),
  notes: z
    .union([z.literal(""), z.null(), z.string()])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value?.trim() ? value.trim() : null
    ),
});

export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
