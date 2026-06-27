import { z } from "zod";
import { ROOM_STATUSES } from "@/types/room";

export const roomSchema = z
  .object({
    room_number: z
      .string()
      .trim()
      .min(1, "Room Number is required"),

    room_type_id: z
      .number()
      .int("Room type is required")
      .positive("Room type is required"),

    status: z
      .enum(ROOM_STATUSES)
      .default("available"),
  })
  .strict();

export type RoomSchema = z.infer<typeof roomSchema>;