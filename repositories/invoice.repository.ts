import type { SupabaseClient } from "@supabase/supabase-js";
import type { Invoice, InvoiceWithRelations } from "@/types/invoice";
import type { Payment } from "@/types/invoice";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { getPaginationRange, toPaginatedResult } from "@/types/pagination";
import { buildInvoiceNo } from "@/lib/bookingCalculations";

export type InvoiceRecord = {
  invoice_no: string;
  booking_id?: number | null;
  group_id?: number | null;
  customer_id?: number | null;
  total_bill: number;
  subtotal?: number;
  amount_paid: number;
  due_amount: number;
  status: Invoice["status"];
  notes?: string | null;
};

export type PaymentRecord = {
  invoice_id: number;
  amount: number;
  payment_method: Payment["payment_method"];
  reference?: string | null;
  notes?: string | null;
};

function withLegacyAmountColumns(input: InvoiceRecord): InvoiceRecord & {
  subtotal: number;
  total: number;
} {
  const bill = Number(input.total_bill);
  return {
    ...input,
    total_bill: bill,
    subtotal: input.subtotal ?? bill,
    total: bill,
  };
}

const bookingRelationSelect = `
  id,
  booking_no,
  check_in,
  check_out,
  nights,
  customers (
    id,
    name,
    mobile,
    email
  ),
  room_types (
    id,
    name
  )
`;

const groupRelationSelect = `
  id,
  group_name,
  check_in,
  check_out,
  contact_person,
  mobile,
  customers (
    id,
    name,
    mobile,
    email
  )
`;

export class InvoiceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async enrichInvoices(
    invoices: Invoice[]
  ): Promise<InvoiceWithRelations[]> {
    if (invoices.length === 0) return [];

    const bookingIds = [
      ...new Set(
        invoices
          .map((invoice) => invoice.booking_id)
          .filter((id): id is number => id != null)
      ),
    ];
    const groupIds = [
      ...new Set(
        invoices
          .map((invoice) => invoice.group_id)
          .filter((id): id is number => id != null)
      ),
    ];
    const invoiceIds = invoices.map((invoice) => invoice.id);

    const bookingsPromise =
      bookingIds.length > 0
        ? this.supabase
            .from("bookings")
            .select(bookingRelationSelect)
            .in("id", bookingIds)
        : Promise.resolve({ data: [], error: null });

    const groupsPromise =
      groupIds.length > 0
        ? this.supabase
            .from("booking_groups")
            .select(groupRelationSelect)
            .in("id", groupIds)
        : Promise.resolve({ data: [], error: null });

    const paymentsPromise =
      invoiceIds.length > 0
        ? this.supabase
            .from("payments")
            .select("*")
            .in("invoice_id", invoiceIds)
            .order("paid_at", { ascending: false })
        : Promise.resolve({ data: [], error: null });

    const [bookingsResult, groupsResult, paymentsResult] = await Promise.all([
      bookingsPromise,
      groupsPromise,
      paymentsPromise,
    ]);

    if (bookingsResult.error) throw bookingsResult.error;
    if (groupsResult.error) throw groupsResult.error;
    if (paymentsResult.error) throw paymentsResult.error;

    type BookingRelation = NonNullable<InvoiceWithRelations["bookings"]>;
    type GroupRelation = NonNullable<InvoiceWithRelations["booking_groups"]>;

    const bookingMap = new Map<number, BookingRelation>(
      (bookingsResult.data ?? []).map((booking) => [
        booking.id as number,
        booking as unknown as BookingRelation,
      ])
    );
    const groupMap = new Map<number, GroupRelation>(
      (groupsResult.data ?? []).map((group) => [
        group.id as number,
        group as unknown as GroupRelation,
      ])
    );

    const paymentsByInvoice = new Map<number, Payment[]>();
    for (const payment of paymentsResult.data ?? []) {
      const list = paymentsByInvoice.get(payment.invoice_id) ?? [];
      list.push(payment);
      paymentsByInvoice.set(payment.invoice_id, list);
    }

    return invoices.map((invoice) => ({
      ...invoice,
      bookings: invoice.booking_id
        ? (bookingMap.get(invoice.booking_id) ?? null)
        : null,
      booking_groups: invoice.group_id
        ? (groupMap.get(invoice.group_id) ?? null)
        : null,
      payments: paymentsByInvoice.get(invoice.id) ?? [],
    }));
  }

  private async enrichInvoice(
    invoice: Invoice
  ): Promise<InvoiceWithRelations> {
    const [enriched] = await this.enrichInvoices([invoice]);
    return enriched;
  }

  async getNextInvoiceNo(): Promise<string> {
    const { count, error } = await this.supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return buildInvoiceNo((count ?? 0) + 1);
  }

  async findPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<InvoiceWithRelations>> {
    const { from, to } = getPaginationRange(params);
    let query = this.supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .order("issued_at", { ascending: false });

    if (params.search) {
      query = query.or(
        `invoice_no.ilike.%${params.search}%,notes.ilike.%${params.search}%`
      );
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    const enriched = await this.enrichInvoices(data ?? []);
    return toPaginatedResult(enriched, count ?? 0, params);
  }

  async findById(id: number): Promise<InvoiceWithRelations | null> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return this.enrichInvoice(data);
  }

  async findActiveByBookingId(bookingId: number): Promise<Invoice | null> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("*")
      .eq("booking_id", bookingId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findActiveByGroupId(groupId: number): Promise<Invoice | null> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("*")
      .eq("group_id", groupId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: InvoiceRecord): Promise<InvoiceWithRelations> {
    const { data, error } = await this.supabase
      .from("invoices")
      .insert(withLegacyAmountColumns(input))
      .select("*")
      .single();

    if (error) throw error;
    return this.enrichInvoice(data);
  }

  async update(
    id: number,
    input: Partial<InvoiceRecord>
  ): Promise<InvoiceWithRelations> {
    const { data, error } = await this.supabase
      .from("invoices")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return this.enrichInvoice(data);
  }

  async createPayment(input: PaymentRecord): Promise<Payment> {
    const { data, error } = await this.supabase
      .from("payments")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
