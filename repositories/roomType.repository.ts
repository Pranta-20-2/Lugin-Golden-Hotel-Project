import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateRoomTypeInput,
  RoomType,
  RoomTypeWithAvailability,
  UpdateRoomTypeInput,
} from "@/types/roomType";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";
import { BookingRepository } from "@/repositories/booking.repository";
import { calculateAvailableCount } from "@/lib/roomTypeAvailability";

export class RoomTypeRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<RoomType[]> {
    const { data, error } = await this.supabase
      .from("room_types")
      .select("*")
      .order("name");

    if (error) throw error;
    return data ?? [];
  }

  async findPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<RoomType>> {
    const { from, to } = getPaginationRange(params);
    let query = this.supabase
      .from("room_types")
      .select("*", { count: "exact" })
      .order("name");

    if (params.search) {
      query = query.ilike("name", `%${params.search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return toPaginatedResult(data ?? [], count ?? 0, params);
  }

  async findById(id: number): Promise<RoomType | null> {
    const { data, error } = await this.supabase
      .from("room_types")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findAllWithAvailability(
    checkIn: string,
    checkOut: string,
    options?: { excludeBookingId?: number; excludeGroupId?: number }
  ): Promise<RoomTypeWithAvailability[]> {
    const roomTypes = await this.findAll();
    return this.enrichWithAvailability(roomTypes, checkIn, checkOut, options);
  }

  async enrichWithAvailability(
    roomTypes: RoomType[],
    checkIn: string,
    checkOut: string,
    options?: { excludeBookingId?: number; excludeGroupId?: number }
  ): Promise<RoomTypeWithAvailability[]> {
    const bookingRepository = new BookingRepository(this.supabase);

    return Promise.all(
      roomTypes.map(async (roomType) => {
        const bookedCount = await bookingRepository.countOverlappingByRoomTypeId(
          roomType.id,
          checkIn,
          checkOut,
          options
        );

        return {
          ...roomType,
          booked_count: bookedCount,
          available_count: calculateAvailableCount(
            roomType.total_rooms,
            bookedCount
          ),
        };
      })
    );
  }

  async findPaginatedWithAvailability(
    params: PaginationParams,
    checkIn: string,
    checkOut: string
  ): Promise<PaginatedResult<RoomTypeWithAvailability>> {
    const result = await this.findPaginated(params);
    const data = await this.enrichWithAvailability(
      result.data,
      checkIn,
      checkOut
    );
    return { ...result, data };
  }

  async findByIdWithAvailability(
    id: number,
    checkIn: string,
    checkOut: string
  ): Promise<RoomTypeWithAvailability | null> {
    const roomType = await this.findById(id);
    if (!roomType) return null;

    const [withAvailability] = await this.enrichWithAvailability(
      [roomType],
      checkIn,
      checkOut
    );
    return withAvailability;
  }

  async create(input: CreateRoomTypeInput): Promise<RoomType> {
    const { data, error } = await this.supabase
      .from("room_types")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: number, input: UpdateRoomTypeInput): Promise<RoomType> {
    const { data, error } = await this.supabase
      .from("room_types")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("room_types")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
