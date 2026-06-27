import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from "@/types/customer";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";

export class CustomerRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<Customer[]> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async findPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<Customer>> {
    const { from, to } = getPaginationRange(params);
    let query = this.supabase
      .from("customers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,mobile.ilike.%${params.search}%,email.ilike.%${params.search}%`
      );
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return toPaginatedResult(data ?? [], count ?? 0, params);
  }

  async findById(id: number): Promise<Customer | null> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const { data, error } = await this.supabase
      .from("customers")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: number, input: UpdateCustomerInput): Promise<Customer> {
    const { data, error } = await this.supabase
      .from("customers")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
