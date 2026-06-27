import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateRoomInput,
  RoomStatus,
  RoomWithType,
  UpdateRoomInput,
} from "@/types/room";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";
import type { BookingStatus } from "@/types/booking";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/bookingRoomStatusSync";

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
    const rooms = data ?? [];
    return this.attachBookingStatuses(rooms);
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
    const rooms = data ?? [];
    const enriched = await this.attachBookingStatuses(rooms);
    return toPaginatedResult(enriched, count ?? 0, params);
  }

  private async attachBookingStatuses(
    rooms: RoomWithType[]
  ): Promise<RoomWithType[]> {
    if (rooms.length === 0) return rooms;

    const roomIds = rooms.map((room) => room.id);
    const { data, error } = await this.supabase
      .from("bookings")
      .select("room_id, status, group_id, updated_at")
      .in("room_id", roomIds)
      .in("status", ACTIVE_BOOKING_STATUSES)
      .order("updated_at", { ascending: false });

    if (error) return rooms;

    const bookingByRoom = new Map<
      number,
      { status: BookingStatus; group_id: number | null }
    >();
    for (const row of data ?? []) {
      if (row.room_id != null && !bookingByRoom.has(row.room_id)) {
        bookingByRoom.set(row.room_id, {
          status: row.status as BookingStatus,
          group_id: row.group_id != null ? Number(row.group_id) : null,
        });
      }
    }

    return rooms.map((room) => {
      const active = bookingByRoom.get(room.id);
      return {
        ...room,
        booking_status: active?.status ?? null,
        active_booking_group_id: active?.group_id ?? null,
      };
    });
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
    if (!data) return null;
    const [room] = await this.attachBookingStatuses([data]);
    return room;
  }

  async findStatusById(id: number): Promise<RoomStatus | null> {
    const { data, error } = await this.supabase
      .from("rooms")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return (data?.status as RoomStatus | undefined) ?? null;
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

  async updateOperationalStatus(id: number, status: RoomStatus): Promise<void> {
    const { error } = await this.supabase
      .from("rooms")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
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