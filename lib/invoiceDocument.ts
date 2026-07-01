import { calculateNights } from "@/lib/bookingCalculations";
import { formatAmount } from "@/lib/formatCurrency";
import { formatStayRange } from "@/lib/stayDates";
import type { InvoiceWithRelations } from "@/types/invoice";
import {
  INVOICE_STATUS_LABELS,
  getInvoiceGuest,
  getInvoiceMobile,
} from "@/types/invoice";

export type InvoiceDocumentData = {
  invoiceNo: string;
  guest: string;
  mobile: string;
  source: string;
  stay: string;
  status: string;
  issuedAt: string;
  notes: string;
  nights: number;
  totalBill: string;
  amountPaid: string;
  dueAmount: string;
  fullyPaid: boolean;
};

function formatDocumentDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInvoiceSourceLabel(invoice: InvoiceWithRelations): string {
  if (invoice.group_id) {
    return invoice.booking_groups?.group_name ?? "Group booking";
  }

  const booking = invoice.bookings;
  const roomType = booking?.room_types?.name;
  const bookingNo = booking?.booking_no ?? "Individual booking";
  return roomType ? `${bookingNo} · ${roomType}` : bookingNo;
}

export function getInvoiceStayLabel(invoice: InvoiceWithRelations): string {
  const booking = invoice.bookings;
  const group = invoice.booking_groups;

  if (!booking && !group) return "—";

  return formatStayRange(
    booking?.check_in ?? group?.check_in,
    booking?.check_out ?? group?.check_out
  );
}

export function buildInvoiceDocumentData(
  invoice: InvoiceWithRelations
): InvoiceDocumentData {
  const booking = invoice.bookings;
  const group = invoice.booking_groups;
  const nights =
    booking?.nights ??
    (group ? calculateNights(group.check_in, group.check_out) : 0);
  const totalBill = Number(invoice.total_bill ?? 0);
  const amountPaid = Number(invoice.amount_paid ?? 0);
  const dueAmount = Number(invoice.due_amount ?? 0);

  return {
    invoiceNo: invoice.invoice_no,
    guest: getInvoiceGuest(invoice),
    mobile: getInvoiceMobile(invoice),
    source: getInvoiceSourceLabel(invoice),
    stay: getInvoiceStayLabel(invoice),
    status: INVOICE_STATUS_LABELS[invoice.status],
    issuedAt: formatDocumentDate(invoice.issued_at),
    notes: invoice.notes?.trim() || "—",
    nights,
    totalBill: formatAmount(totalBill),
    amountPaid: formatAmount(amountPaid),
    dueAmount: formatAmount(dueAmount),
    fullyPaid: dueAmount === 0,
  };
}

export function getInvoicePdfFilename(invoiceNo: string) {
  const safe = invoiceNo.replace(/[^\w.-]+/g, "_");
  return `${safe || "invoice"}.pdf`;
}
