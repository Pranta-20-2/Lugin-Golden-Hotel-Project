import type { BookingStatus } from "@/types/booking";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from "@/types/booking";

export type { BookingStatus };
export { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS };

export type RevenueByRoomType = {
  name: string;
  revenue: number;
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
};

