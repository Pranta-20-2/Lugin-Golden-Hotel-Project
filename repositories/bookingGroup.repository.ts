import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BookingGroup,
  BookingGroupWithRelations,
} from "@/types/bookingGroup";
import type { BookingStatus } from "@/types/booking";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";

type BookingGroupListParams = PaginationParams & {
  status?: BookingStatus;
};

export type BookingGroupRecord = {
  group_name: string;
  customer_id?: number | null;
  contact_person: string;
  mobile: string;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  notes?: string | null;
};

const bookingGroupSelect = `
  *,
  customers (
    id,
    name,
    mobile,
    email,
    national_id,
    address
  ),
  bookings (
    id,
    booking_no,
    room_type_id,
    nights,
    rate_per_night,
    total_bill,
    advance_paid,
    due_amount,
    status,
    room_types (
      id,
      name
    )
  )
`;

export class BookingGroupRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findPaginated(
    params: BookingGroupListParams
  ): Promise<PaginatedResult<BookingGroupWithRelations>> {
    const { from, to } = getPaginationRange(params);
    let query = this.supabase
      .from("booking_groups")
      .select(bookingGroupSelect, { count: "exact" })
      .order("check_in", { ascending: false });

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.search) {
      query = query.or(
        `group_name.ilike.%${params.search}%,contact_person.ilike.%${params.search}%,mobile.ilike.%${params.search}%`
      );
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return toPaginatedResult(data ?? [], count ?? 0, params);
  }

  async findById(id: number): Promise<BookingGroupWithRelations | null> {
    const { data, error } = await this.supabase
      .from("booking_groups")
      .select(bookingGroupSelect)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: BookingGroupRecord): Promise<BookingGroup> {
    const { data, error } = await this.supabase
      .from("booking_groups")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: number, input: BookingGroupRecord): Promise<BookingGroup> {
    const { data, error } = await this.supabase
      .from("booking_groups")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("booking_groups")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
