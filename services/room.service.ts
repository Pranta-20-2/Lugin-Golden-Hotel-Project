import type { SupabaseClient } from "@supabase/supabase-js";
import { RoomRepository } from "@/repositories/room.repository";
import type { RoomStatus, RoomWithType } from "@/types/room";
import { roomSchema } from "@/validators/room.schema";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";

type RoomListParams = PaginationParams & {
  status?: RoomStatus;
};

export class RoomServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "RoomServiceError";
  }
}

function mapSupabaseError(error: { code?: string; message: string }): never {
  if (error.code === "23505") {
    throw new RoomServiceError("A room with this number already exists", 409);
  }

  if (error.code === "23503") {
    throw new RoomServiceError("Selected room type does not exist", 400);
  }

  if (error.code === "PGRST116") {
    throw new RoomServiceError("Room not found", 404);
  }

  throw new RoomServiceError(error.message, 500);
}

export class RoomService {
  private readonly repository: RoomRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new RoomRepository(supabase);
  }

  async getAll(): Promise<RoomWithType[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getPaginated(
    params: RoomListParams
  ): Promise<PaginatedResult<RoomWithType>> {
    try {
      return await this.repository.findPaginated(params);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getById(id: number): Promise<RoomWithType> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new RoomServiceError("Invalid room id", 400);
    }

    try {
      const room = await this.repository.findById(id);
      if (!room) {
        throw new RoomServiceError("Room not found", 404);
      }
      return room;
    } catch (error) {
      if (error instanceof RoomServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async create(input: unknown): Promise<RoomWithType> {
    const parsed = roomSchema.safeParse(input);
    if (!parsed.success) {
      throw new RoomServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    try {
      return await this.repository.create(parsed.data);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async update(id: number, input: unknown): Promise<RoomWithType> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new RoomServiceError("Invalid room id", 400);
    }

    const parsed = roomSchema.safeParse(input);
    if (!parsed.success) {
      throw new RoomServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    try {
      return await this.repository.update(id, parsed.data);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async delete(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new RoomServiceError("Invalid room id", 400);
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }
}