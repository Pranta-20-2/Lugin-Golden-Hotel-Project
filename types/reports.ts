import type { BookingsByStatus, RevenueByRoomType } from "@/types/dashboard";
import type { InvoiceStatus } from "@/types/invoice";

export type MonthlyRevenue = {
  month: string;
  label: string;
  revenue: number;
};

export type InvoicesByStatus = {
  status: InvoiceStatus;
  label: string;
  count: number;
  amount: number;
};

export type ReportStats = {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  invoiceCount: number;
  totalBookings: number;
  roomTypeCount: number;
  monthlyRevenue: MonthlyRevenue[];
  revenueByRoomType: RevenueByRoomType[];
  bookingsByStatus: BookingsByStatus[];
  invoicesByStatus: InvoicesByStatus[];
};
