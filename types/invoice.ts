export type InvoiceStatus = "issued" | "partial" | "paid" | "cancelled";

export interface Invoice {
  id: number;
  invoice_no: string;
  booking_id?: number | null;
  group_id?: number | null;
  customer_id?: number | null;
  total_bill: number;
  amount_paid: number;
  due_amount: number;
  status: InvoiceStatus;
  notes?: string | null;
  issued_at: string;
  created_at?: string;
  updated_at?: string;
}

export type InvoiceCustomer = {
  id: number;
  name: string;
  mobile: string;
  email?: string | null;
};

export type InvoiceWithRelations = Invoice & {
  bookings?: {
    id: number;
    booking_no: string;
    check_in: string;
    check_out: string;
    nights: number;
    customers?: InvoiceCustomer | null;
    room_types?: { id: number; name: string } | null;
  } | null;
  booking_groups?: {
    id: number;
    group_name: string;
    check_in: string;
    check_out: string;
    contact_person: string;
    mobile: string;
    customers?: InvoiceCustomer | null;
  } | null;
};

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "issued",
  "partial",
  "paid",
  "cancelled",
];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  issued: "Issued",
  partial: "Partially Paid",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  issued: "#3b82f6",
  partial: "#f59e0b",
  paid: "#22c55e",
  cancelled: "#ef4444",
};

export function resolveInvoiceStatus(
  totalBill: number,
  amountPaid: number
): InvoiceStatus {
  if (amountPaid <= 0) return "issued";
  if (amountPaid >= totalBill) return "paid";
  return "partial";
}

export function getInvoiceGuest(invoice: InvoiceWithRelations): string {
  return (
    invoice.bookings?.customers?.name ??
    invoice.booking_groups?.customers?.name ??
    invoice.booking_groups?.contact_person ??
    "—"
  );
}

export function getInvoiceMobile(invoice: InvoiceWithRelations): string {
  return (
    invoice.bookings?.customers?.mobile ??
    invoice.booking_groups?.customers?.mobile ??
    invoice.booking_groups?.mobile ??
    "—"
  );
}
