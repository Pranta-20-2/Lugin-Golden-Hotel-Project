import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BookingStatus,
  BookingWithRelations,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/types/booking";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/bookingRoomStatusSync";
import {
  buildBookingNo,
  parseBookingNoSequence,
} from "@/lib/bookingCalculations";
import { datesOverlap } from "@/lib/roomTypeAvailability";

type BookingListParams = PaginationParams & {
  status?: BookingStatus;
};

type OverlapOptions = {
  excludeBookingId?: number;
  excludeGroupId?: number;
};

const bookingSelect = `
  *,
  customers (
    id,
    name,
    mobile
  ),
  room_types (
    id,
    name,
    rate_per_night
  )
`;

export class BookingRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getNextBookingNo(): Promise<string> {
    const [bookingNo] = await this.getNextBookingNos(1);
    return bookingNo;
  }

  private async getMaxBookingSequence(): Promise<number> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select("booking_no")
      .order("id", { ascending: false })
      .limit(50);

    if (error) throw error;

    let maxSeq = 0;
    for (const row of data ?? []) {
      const sequence = parseBookingNoSequence(String(row.booking_no));
      if (sequence != null) {
        maxSeq = Math.max(maxSeq, sequence);
      }
    }

    return maxSeq;
  }

  async getNextBookingNos(count: number): Promise<string[]> {
    if (count <= 0) return [];

    const maxSeq = await this.getMaxBookingSequence();
    const start = maxSeq + 1;

    return Array.from({ length: count }, (_, index) =>
      buildBookingNo(start + index)
    );
  }

  async findPaginated(
    params: BookingListParams
  ): Promise<PaginatedResult<BookingWithRelations>> {
    const { from, to } = getPaginationRange(params);
    let query = this.supabase
      .from("bookings")
      .select(bookingSelect, { count: "exact" })
      .is("group_id", null)
      .order("check_in", { ascending: false });

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.search) {
      const customerIds = await this.findCustomerIdsBySearch(params.search);
      const roomTypeIds = await this.findRoomTypeIdsBySearch(params.search);
      const filters = [`booking_no.ilike.%${params.search}%`];

      if (customerIds.length > 0) {
        filters.push(`customer_id.in.(${customerIds.join(",")})`);
      }
      if (roomTypeIds.length > 0) {
        filters.push(`room_type_id.in.(${roomTypeIds.join(",")})`);
      }

      query = query.or(filters.join(","));
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return toPaginatedResult(data ?? [], count ?? 0, params);
  }

  async findById(id: number): Promise<BookingWithRelations | null> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select(bookingSelect)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async countOverlappingByRoomTypeId(
    roomTypeId: number,
    checkIn: string,
    checkOut: string,
    options: OverlapOptions = {}
  ): Promise<number> {
    let query = this.supabase
      .from("bookings")
      .select("id, check_in, check_out, group_id")
      .eq("room_type_id", roomTypeId)
      .in("status", ACTIVE_BOOKING_STATUSES)
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);

    if (options.excludeBookingId != null) {
      query = query.neq("id", options.excludeBookingId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const rows = (data ?? []).filter((row) => {
      if (
        options.excludeGroupId != null &&
        row.group_id === options.excludeGroupId
      ) {
        return false;
      }
      return datesOverlap(checkIn, checkOut, row.check_in, row.check_out);
    });

    return rows.length;
  }

  async create(input: CreateBookingInput): Promise<BookingWithRelations> {
    const { data, error } = await this.supabase
      .from("bookings")
      .insert(input)
      .select(bookingSelect)
      .single();

    if (error) throw error;
    return data;
  }

  async createMany(inputs: CreateBookingInput[]): Promise<void> {
    if (inputs.length === 0) return;

    const { error } = await this.supabase.from("bookings").insert(inputs);

    if (error) throw error;
  }

  async findByGroupId(groupId: number): Promise<BookingWithRelations[]> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select(bookingSelect)
      .eq("group_id", groupId)
      .order("room_type_id");

    if (error) throw error;
    return data ?? [];
  }

  async deleteByGroupId(groupId: number): Promise<void> {
    const { error } = await this.supabase
      .from("bookings")
      .delete()
      .eq("group_id", groupId);

    if (error) throw error;
  }

  async update(
    id: number,
    input: UpdateBookingInput
  ): Promise<BookingWithRelations> {
    const { data, error } = await this.supabase
      .from("bookings")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(bookingSelect)
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private async findCustomerIdsBySearch(search: string): Promise<number[]> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("id")
      .or(`name.ilike.%${search}%,mobile.ilike.%${search}%`);

    if (error) throw error;
    return (data ?? []).map((row) => Number(row.id));
  }

  private async findRoomTypeIdsBySearch(search: string): Promise<number[]> {
    const { data, error } = await this.supabase
      .from("room_types")
      .select("id")
      .ilike("name", `%${search}%`);

    if (error) throw error;
    return (data ?? []).map((row) => Number(row.id));
  }
}
