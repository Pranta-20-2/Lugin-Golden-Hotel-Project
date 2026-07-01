import { roundMoney } from "@/lib/formatCurrency";
import { parseLocalDate } from "@/lib/stayDates";

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
}

export function calculateTotalBill(nights: number, ratePerNight: number): number {
  return Math.max(0, nights) * Math.max(0, Number(ratePerNight));
}

export function calculateDueAmount(totalBill: number, advancePaid: number): number {
  return Math.max(0, roundMoney(Number(totalBill) - Number(advancePaid)));
}

export function buildBookingNo(sequence: number, date = new Date()): string {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `BK-${ymd}-${String(sequence).padStart(4, "0")}`;
}

export function parseBookingNoSequence(bookingNo: string): number | null {
  const match = bookingNo.match(/-(\d+)$/);
  if (!match) return null;
  const sequence = Number(match[1]);
  return Number.isFinite(sequence) ? sequence : null;
}

export function buildInvoiceNo(sequence: number, date = new Date()): string {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${ymd}-${String(sequence).padStart(4, "0")}`;
}

export { roundMoney };
