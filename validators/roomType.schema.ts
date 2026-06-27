import { z } from "zod";

export const roomTypeSchema = z
  .object({
    name: z.string().min(1, "Room Type Name Is Required"),
    rate_per_night: z.number().positive("Rate must be greater than 0"),
    notes: z.string().optional(),
  })
  .strict();

export type RoomTypeSchema = z.infer<typeof roomTypeSchema>;
