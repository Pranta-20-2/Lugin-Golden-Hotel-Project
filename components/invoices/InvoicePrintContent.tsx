import Link from "next/link";
import type { InvoiceWithRelations } from "@/types/invoice";
import { getInvoiceGuest, getInvoiceMobile } from "@/types/invoice";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import DetailView, { formatDate } from "@/components/ui/DetailView";
import { formatStayRange } from "@/lib/stayDates";
import BillingSummary from "@/components/ui/BillingSummary";
import Card from "@/components/ui/Card";
import { calculateNights } from "@/lib/bookingCalculations";

type InvoicePrintContentProps = {
  invoice: InvoiceWithRelations;
  visible?: boolean;
  editHref?: string;
  extraActions?: React.ReactNode;
  deleteSlot?: React.ReactNode;
};

export default function InvoicePrintContent({
  invoice,
  visible = false,
  editHref,
  extraActions,
  deleteSlot,
}: InvoicePrintContentProps) {
  const isGroup = Boolean(invoice.group_id);
  const booking = invoice.bookings;
  const group = invoice.booking_groups;

  const nights =
    booking?.nights ??
    (group ? calculateNights(group.check_in, group.check_out) : 0);
  const totalBill = Number(invoice.total_bill ?? 0);
  const amountPaid = Number(invoice.amount_paid ?? 0);
  const dueAmount = Number(invoice.due_amount ?? 0);

  return (
    <div
      id="invoice-print-area"
      className={`space-y-5 ${visible ? "" : "hidden print:block"}`}
    >
      <DetailView
        title={invoice.invoice_no}
        subtitle={getInvoiceGuest(invoice)}
        editHref={editHref}
        extraActions={extraActions}
        deleteSlot={deleteSlot}
        fields={[
          { label: "Guest", value: getInvoiceGuest(invoice) },
          { label: "Mobile", value: getInvoiceMobile(invoice) },
          {
            label: "Source",
            value: isGroup ? (
              <Link
                href={`/booking-groups/${invoice.group_id}`}
                className="text-primary hover:underline"
              >
                {group?.group_name ?? "Group booking"}
              </Link>
            ) : (
              <Link
                href={`/bookings/${invoice.booking_id}`}
                className="text-primary hover:underline"
              >
                {booking?.booking_no ?? "Individual booking"}
                {booking?.room_types?.name ? ` · ${booking.room_types.name}` : ""}
              </Link>
            ),
          },
          {
            label: "Stay",
            value:
              booking || group
                ? formatStayRange(
                    booking?.check_in ?? group?.check_in,
                    booking?.check_out ?? group?.check_out
                  )
                : "—",
          },
          {
            label: "Status",
            value: <InvoiceStatusBadge status={invoice.status} />,
          },
          { label: "Issued", value: formatDate(invoice.issued_at) },
          { label: "Notes", value: invoice.notes || "—" },
        ]}
      />

      <BillingSummary
        nights={nights}
        ratePerNight={0}
        showRatePerNight={false}
        alwaysShowAmounts
        totalBill={totalBill}
        advancePaid={amountPaid}
        paidLabel="Amount Paid"
        dueAmount={dueAmount}
      />

      {dueAmount === 0 && (
        <Card padding="sm" className="border border-emerald-100 bg-emerald-50">
          <p className="text-sm font-medium text-emerald-700">
            Invoice is fully paid.
          </p>
        </Card>
      )}
    </div>
  );
}
