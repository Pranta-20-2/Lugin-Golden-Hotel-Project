import type { SupabaseClient } from "@supabase/supabase-js";
import { RoomTypeRepository } from "@/repositories/roomType.repository";
import type { RoomType } from "@/types/roomType";
import { roomTypeSchema } from "@/validators/roomType.schema";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

function mapSupabaseError(error: { code?: string; message: string }): never {
  if (error.code === "23505") {
    throw new ServiceError("A room type with this name already exists", 409);
  }
  if (error.code === "PGRST116") {
    throw new ServiceError("Room type not found", 404);
  }
  throw new ServiceError(error.message, 500);
}

export class RoomTypeService {
  private readonly repository: RoomTypeRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new RoomTypeRepository(supabase);
  }

  async getAll(): Promise<RoomType[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<RoomType>> {
    try {
      return await this.repository.findPaginated(params);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getById(id: number): Promise<RoomType> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ServiceError("Invalid room type id", 400);
    }

    try {
      const roomType = await this.repository.findById(id);
      if (!roomType) {
        throw new ServiceError("Room type not found", 404);
      }
      return roomType;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async create(input: unknown): Promise<RoomType> {
    const parsed = roomTypeSchema.safeParse(input);
    if (!parsed.success) {
      throw new ServiceError(
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

  async update(id: number, input: unknown): Promise<RoomType> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ServiceError("Invalid room type id", 400);
    }

    const parsed = roomTypeSchema.safeParse(input);
    if (!parsed.success) {
      throw new ServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    try {
      return await this.repository.update(id, parsed.data);
    } catch (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        throw new ServiceError("Room type not found", 404);
      }
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async delete(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new ServiceError("Invalid room type id", 400);
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }
}
