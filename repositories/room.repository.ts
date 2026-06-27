import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateRoomInput,
  RoomStatus,
  RoomWithType,
  UpdateRoomInput,
} from "@/types/room";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";

type RoomListParams = PaginationParams & {
  status?: RoomStatus;
};

export class RoomRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<RoomWithType[]> {
    const { data, error } = await this.supabase
      .from("rooms")
      .select(`
        *,
        room_types (
          id,
          name,
          rate_per_night
        )
      `)
      .order("room_number");

    if (error) throw error;
    return data ?? [];
  }

  async findPaginated(
    params: RoomListParams
  ): Promise<PaginatedResult<RoomWithType>> {
    const { from, to } = getPaginationRange(params);
    let query = this.supabase
      .from("rooms")
      .select(
        `
        *,
        room_types (
          id,
          name,
          rate_per_night
        )
      `,
        { count: "exact" }
      )
      .order("room_number");

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.search) {
      const matchingTypeIds = await this.findRoomTypeIdsByName(params.search);

      if (matchingTypeIds.length > 0) {
        query = query.or(
          `room_number.ilike.%${params.search}%,room_type_id.in.(${matchingTypeIds.join(",")})`
        );
      } else {
        query = query.ilike("room_number", `%${params.search}%`);
      }
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return toPaginatedResult(data ?? [], count ?? 0, params);
  }

  private async findRoomTypeIdsByName(search: string): Promise<number[]> {
    const { data, error } = await this.supabase
      .from("room_types")
      .select("id")
      .ilike("name", `%${search}%`);

    if (error) throw error;
    return (data ?? []).map((item) => Number(item.id));
  }

  async findById(id: number): Promise<RoomWithType | null> {
    const { data, error } = await this.supabase
      .from("rooms")
      .select(`
        *,
        room_types (
          id,
          name,
          rate_per_night
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: CreateRoomInput): Promise<RoomWithType> {
    const { data, error } = await this.supabase
      .from("rooms")
      .insert(input)
      .select(`
        *,
        room_types (
          id,
          name,
          rate_per_night
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: number, input: UpdateRoomInput): Promise<RoomWithType> {
    const { data, error } = await this.supabase
      .from("rooms")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`
        *,
        room_types (
          id,
          name,
          rate_per_night
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("rooms")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}