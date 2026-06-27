import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateRoomTypeInput,
  RoomType,
  UpdateRoomTypeInput,
} from "@/types/roomType";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";

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
