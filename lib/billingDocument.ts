import { formatAmount } from "@/lib/formatCurrency";
import { formatStayRange } from "@/lib/stayDates";
import type { BookingWithRelations } from "@/types/booking";
import type { BookingGroupWithRelations } from "@/types/bookingGroup";
import { getBookingGroupTotals } from "@/types/bookingGroup";
import { BOOKING_STATUS_LABELS } from "@/types/booking";

export type BillingRoomTypeLine = {
  name: string;
  nights: number;
  rate: string;
  total: string;
};

export type BillingDocumentData = {
  documentTitle: string;
  referenceNo: string;
  guest: string;
  mobile: string;
  source: string;
  stay: string;
  status: string;
  notes: string;
  nights: number;
  ratePerNight?: string;
  showRatePerNight: boolean;
  roomCount?: number;
  totalBill: string;
  advancePaid: string;
  dueAmount: string;
  fullyPaid: boolean;
  roomTypeLines?: BillingRoomTypeLine[];
};

export function getBillingPdfFilename(referenceNo: string) {
  const safe = referenceNo.replace(/[^\w.-]+/g, "_");
  return `${safe || "billing"}.pdf`;
}

export function buildBookingBillingDocument(
  booking: BookingWithRelations
): BillingDocumentData {
  const totalBill = Number(booking.total_bill ?? 0);
  const advancePaid = Number(booking.advance_paid ?? 0);
  const dueAmount = Number(booking.due_amount ?? 0);

  return {
    documentTitle: "Booking Summary",
    referenceNo: booking.booking_no,
    guest: booking.customers?.name ?? "—",
    mobile: booking.customers?.mobile ?? "—",
    source: booking.room_types?.name ?? "—",
    stay: formatStayRange(booking.check_in, booking.check_out),
    status: BOOKING_STATUS_LABELS[booking.status],
    notes: booking.notes?.trim() || "—",
    nights: booking.nights,
    ratePerNight: formatAmount(Number(booking.rate_per_night)),
    showRatePerNight: true,
    totalBill: formatAmount(totalBill),
    advancePaid: formatAmount(advancePaid),
    dueAmount: formatAmount(dueAmount),
    fullyPaid: dueAmount === 0,
  };
}

export function buildGroupBillingDocument(
  group: BookingGroupWithRelations
): BillingDocumentData {
  const totals = getBookingGroupTotals(group);
  const roomTypeLines = (group.bookings ?? []).map((booking) => ({
    name: booking.room_types?.name ?? "—",
    nights: booking.nights,
    rate: formatAmount(Number(booking.rate_per_night)),
    total: formatAmount(Number(booking.total_bill)),
  }));

  return {
    documentTitle: "Group Booking Summary",
    referenceNo: group.group_name,
    guest: group.contact_person,
    mobile: group.mobile,
    source: `${totals.roomCount} room${totals.roomCount === 1 ? "" : "s"}`,
    stay: formatStayRange(group.check_in, group.check_out),
    status: BOOKING_STATUS_LABELS[group.status],
    notes: group.notes?.trim() || "—",
    nights: totals.nights,
    showRatePerNight: false,
    roomCount: totals.roomCount,
    totalBill: formatAmount(totals.totalBill),
    advancePaid: formatAmount(totals.advancePaid),
    dueAmount: formatAmount(totals.dueAmount),
    fullyPaid: totals.dueAmount === 0,
    roomTypeLines,
  };
}
