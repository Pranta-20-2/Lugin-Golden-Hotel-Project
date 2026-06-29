import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BookingsByStatus,
  DashboardStats,
  RevenueByRoomType,
} from "@/types/dashboard";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/types/booking";
import {
  INVOICE_STATUS_LABELS,
  type InvoiceStatus,
} from "@/types/invoice";
import type {
  InvoicesByStatus,
  MonthlyRevenue,
  ReportStats,
} from "@/types/reports";

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export class DashboardRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getRoomTypeCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from("room_types")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count ?? 0;
  }

  async getTotalBookings(): Promise<number> {
    const { count, error } = await this.supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count ?? 0;
  }

  async getTotalCollectedRevenue(): Promise<number> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("amount_paid");

    if (error) throw error;

    return (data ?? []).reduce(
      (sum, row) => sum + Number(row.amount_paid ?? 0),
      0
    );
  }

  async getInvoiceSummary(): Promise<{
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    invoiceCount: number;
  }> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("total_bill, amount_paid, due_amount");

    if (error) throw error;

    const rows = data ?? [];

    return {
      invoiceCount: rows.length,
      totalInvoiced: rows.reduce(
        (sum, row) => sum + Number(row.total_bill ?? 0),
        0
      ),
      totalCollected: rows.reduce(
        (sum, row) => sum + Number(row.amount_paid ?? 0),
        0
      ),
      totalOutstanding: rows.reduce(
        (sum, row) => sum + Number(row.due_amount ?? 0),
        0
      ),
    };
  }

  async getRevenueByRoomType(): Promise<RevenueByRoomType[]> {
    const [bookingsResult, roomTypesResult] = await Promise.all([
      this.supabase
        .from("bookings")
        .select("total_bill, total_amount, room_type_id")
        .not("room_type_id", "is", null),
      this.supabase.from("room_types").select("id, name"),
    ]);

    if (bookingsResult.error) throw bookingsResult.error;
    if (roomTypesResult.error) throw roomTypesResult.error;

    const roomTypeNames = new Map<number, string>(
      (roomTypesResult.data ?? []).map((row) => [row.id as number, row.name as string])
    );
    const totals = new Map<string, number>();

    for (const row of bookingsResult.data ?? []) {
      const name = roomTypeNames.get(row.room_type_id as number);
      if (!name) continue;

      totals.set(
        name,
        (totals.get(name) ?? 0) +
          Number(row.total_bill ?? row.total_amount ?? 0)
      );
    }

    return Array.from(totals.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .filter((item) => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }

  async getBookingsByStatus(): Promise<BookingsByStatus[]> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select("status");

    if (error) throw error;

    const counts = new Map<BookingStatus, number>();

    for (const row of data ?? []) {
      const status = row.status as BookingStatus;
      if (!(status in BOOKING_STATUS_LABELS)) continue;
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([status, count]) => ({
        status,
        label: BOOKING_STATUS_LABELS[status],
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getMonthlyRevenue(monthCount = 6): Promise<MonthlyRevenue[]> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("issued_at, amount_paid")
      .order("issued_at", { ascending: false });

    if (error) throw error;

    const totals = new Map<string, number>();

    for (const row of data ?? []) {
      if (!row.issued_at) continue;
      const date = new Date(row.issued_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      totals.set(
        monthKey,
        (totals.get(monthKey) ?? 0) + Number(row.amount_paid ?? 0)
      );
    }

    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-monthCount)
      .map(([month, revenue]) => ({
        month,
        label: formatMonthLabel(month),
        revenue,
      }));
  }

  async getInvoicesByStatus(): Promise<InvoicesByStatus[]> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("status, total_bill, amount_paid");

    if (error) throw error;

    const counts = new Map<InvoiceStatus, number>();
    const amounts = new Map<InvoiceStatus, number>();

    for (const row of data ?? []) {
      const status = row.status as InvoiceStatus;
      if (!(status in INVOICE_STATUS_LABELS)) continue;

      counts.set(status, (counts.get(status) ?? 0) + 1);
      amounts.set(
        status,
        (amounts.get(status) ?? 0) + Number(row.amount_paid ?? row.total_bill ?? 0)
      );
    }

    return Array.from(counts.entries())
      .map(([status, count]) => ({
        status,
        label: INVOICE_STATUS_LABELS[status],
        count,
        amount: amounts.get(status) ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }
}

export class DashboardService {
  private readonly repository: DashboardRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new DashboardRepository(supabase);
  }

  async getStats(): Promise<DashboardStats> {
    const [
      roomTypeCount,
      totalBookings,
      totalRevenue,
      revenueByRoomType,
      bookingsByStatus,
    ] = await Promise.all([
      this.repository.getRoomTypeCount(),
      this.repository.getTotalBookings(),
      this.repository.getTotalCollectedRevenue(),
      this.repository.getRevenueByRoomType(),
      this.repository.getBookingsByStatus(),
    ]);

    return {
      totalRevenue,
      totalBookings,
      roomTypeCount,
      revenueByRoomType,
      bookingsByStatus,
    };
  }
}

export class ReportsService {
  private readonly repository: DashboardRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new DashboardRepository(supabase);
  }

  async getStats(): Promise<ReportStats> {
    const [
      invoiceSummary,
      totalBookings,
      roomTypeCount,
      monthlyRevenue,
      revenueByRoomType,
      bookingsByStatus,
      invoicesByStatus,
    ] = await Promise.all([
      this.repository.getInvoiceSummary(),
      this.repository.getTotalBookings(),
      this.repository.getRoomTypeCount(),
      this.repository.getMonthlyRevenue(),
      this.repository.getRevenueByRoomType(),
      this.repository.getBookingsByStatus(),
      this.repository.getInvoicesByStatus(),
    ]);

    return {
      ...invoiceSummary,
      totalBookings,
      roomTypeCount,
      monthlyRevenue,
      revenueByRoomType,
      bookingsByStatus,
      invoicesByStatus,
    };
  }
}
