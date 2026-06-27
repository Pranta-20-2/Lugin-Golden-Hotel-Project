export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
}

export function calculateTotalBill(nights: number, ratePerNight: number): number {
  return Math.max(0, nights) * Math.max(0, Number(ratePerNight));
}

export function calculateDueAmount(totalBill: number, advancePaid: number): number {
  return Math.max(0, Number(totalBill) - Number(advancePaid));
}

export function buildBookingNo(sequence: number, date = new Date()): string {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `BK-${ymd}-${String(sequence).padStart(4, "0")}`;
}

export function buildInvoiceNo(sequence: number, date = new Date()): string {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${ymd}-${String(sequence).padStart(4, "0")}`;
}
