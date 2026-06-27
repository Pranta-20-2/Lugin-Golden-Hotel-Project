export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type RevenueByRoomType = {
  name: string;
  revenue: number;
};

export type RoomsByStatus = {
  status: "available" | "occupied" | "maintenance" | "reserved";
  label: string;
  count: number;
  roomTypes: {
    name: string;
    count: number;
  }[];
};

export type BookingsByStatus = {
  status: BookingStatus;
  label: string;
  count: number;
};

export type DashboardStats = {
  totalRevenue: number;
  totalBookings: number;
  roomTypeCount: number;
  revenueByRoomType: RevenueByRoomType[];
  bookingsByStatus: BookingsByStatus[];
  roomsByStatus: RoomsByStatus[];
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  checked_in: "#22c55e",
  checked_out: "#64748b",
  cancelled: "#ef4444",
};
