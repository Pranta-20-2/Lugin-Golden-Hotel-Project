import { z } from "zod";

const optionalText = z
  .union([z.literal(""), z.string().trim()])
  .optional()
  .transform((value) => (value ? value : undefined));

export const customerFieldsSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  mobile: z.string().trim().min(1, "Mobile number is required"),
  email: z
    .union([
      z.literal(""),
      z.string().trim().email("Enter a valid email address"),
    ])
    .optional()
    .transform((value) => (value ? value : undefined)),
  address: optionalText,
  national_id: optionalText,
});

export const customerSchema = customerFieldsSchema.strict();

export type CustomerSchema = z.infer<typeof customerSchema>;
export type CustomerFieldsSchema = z.infer<typeof customerFieldsSchema>;

function toNullable(value: string | undefined) {
  return value ?? null;
}

export function toCustomerRecord(data: CustomerFieldsSchema) {
  return {
    name: data.name,
    mobile: data.mobile,
    email: toNullable(data.email),
    address: toNullable(data.address),
    national_id: toNullable(data.national_id),
  };
}
