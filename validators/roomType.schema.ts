import { z } from "zod";

export const roomTypeSchema = z
  .object({
    name: z.string().min(1, "Room Type Name Is Required"),
    rate_per_night: z.number().positive("Rate must be greater than 0"),
    total_rooms: z
      .number()
      .int("Total rooms must be a whole number")
      .min(0, "Total rooms cannot be negative"),
    notes: z.string().optional(),
  })
  .strict();

export type RoomTypeSchema = z.infer<typeof roomTypeSchema>;
