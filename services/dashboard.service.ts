import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BookingsByStatus,
  DashboardStats,
  RevenueByRoomType,
  RoomsByStatus,
} from "@/types/dashboard";
import {
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/types/dashboard";
import { ROOM_STATUS_LABELS, type RoomStatus } from "@/types/room";

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

  async getTotalRevenue(): Promise<number> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select("total_bill, total_amount");

    if (error) throw error;

    return (data ?? []).reduce(
      (sum, row) =>
        sum + Number(row.total_bill ?? row.total_amount ?? 0),
      0
    );
  }

  async getRevenueByRoomType(): Promise<RevenueByRoomType[]> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select("total_bill, total_amount, room_types(name)")
      .not("room_type_id", "is", null);

    if (error) throw error;

    const totals = new Map<string, number>();

    for (const row of data ?? []) {
      const roomType = row.room_types as
        | { name: string }
        | { name: string }[]
        | null;
      const name = Array.isArray(roomType) ? roomType[0]?.name : roomType?.name;

      if (!name) continue;

      totals.set(
        name,
        (totals.get(name) ?? 0) +
          Number(row.total_bill ?? row.total_amount ?? 0)
      );
    }

    return Array.from(totals.entries())
      .map(([name, revenue]) => ({ name, revenue }))
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
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    return (Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map(
      (status) => ({
        status,
        label: BOOKING_STATUS_LABELS[status],
        count: counts.get(status) ?? 0,
      })
    );
  }

  async getRoomsByStatus(): Promise<RoomsByStatus[]> {
    const { data, error } = await this.supabase
      .from("rooms")
      .select("status, room_types(name)");

    if (error) throw error;

    const counts = new Map<RoomStatus, number>();
    const typeCounts = new Map<RoomStatus, Map<string, number>>();

    for (const row of data ?? []) {
      const status = row.status as RoomStatus;
      const roomType = row.room_types as { name: string } | { name: string }[] | null;
      const roomTypeName = Array.isArray(roomType)
        ? roomType[0]?.name
        : roomType?.name;

      counts.set(status, (counts.get(status) ?? 0) + 1);

      if (roomTypeName) {
        const statusTypeCounts = typeCounts.get(status) ?? new Map<string, number>();
        statusTypeCounts.set(
          roomTypeName,
          (statusTypeCounts.get(roomTypeName) ?? 0) + 1
        );
        typeCounts.set(status, statusTypeCounts);
      }
    }

    return (Object.keys(ROOM_STATUS_LABELS) as RoomStatus[]).map((status) => ({
      status,
      label: ROOM_STATUS_LABELS[status],
      count: counts.get(status) ?? 0,
      roomTypes: Array.from(typeCounts.get(status)?.entries() ?? [])
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    }));
  }

  async getAllRoomTypeNames(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("room_types")
      .select("name")
      .order("name");

    if (error) throw error;
    return (data ?? []).map((row) => row.name);
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
      roomsByStatus,
      roomTypeNames,
    ] = await Promise.all([
      this.repository.getRoomTypeCount(),
      this.repository.getTotalBookings().catch(() => 0),
      this.repository.getTotalRevenue().catch(() => 0),
      this.repository.getRevenueByRoomType().catch(() => []),
      this.repository.getBookingsByStatus().catch(() => []),
      this.repository.getRoomsByStatus().catch(() => []),
      this.repository.getAllRoomTypeNames(),
    ]);

    const revenueMap = new Map(
      revenueByRoomType.map((item) => [item.name, item.revenue])
    );

    const fullRevenueByRoomType: RevenueByRoomType[] = roomTypeNames.map(
      (name) => ({
        name,
        revenue: revenueMap.get(name) ?? 0,
      })
    );

    const fullBookingsByStatus =
      bookingsByStatus.length > 0
        ? bookingsByStatus
        : (Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map(
            (status) => ({
              status,
              label: BOOKING_STATUS_LABELS[status],
              count: 0,
            })
          );

    const fullRoomsByStatus =
      roomsByStatus.length > 0
        ? roomsByStatus
        : (Object.keys(ROOM_STATUS_LABELS) as RoomStatus[]).map((status) => ({
            status,
            label: ROOM_STATUS_LABELS[status],
            count: 0,
            roomTypes: [],
          }));

    return {
      totalRevenue,
      totalBookings,
      roomTypeCount,
      revenueByRoomType: fullRevenueByRoomType,
      bookingsByStatus: fullBookingsByStatus,
      roomsByStatus: fullRoomsByStatus,
    };
  }
}
