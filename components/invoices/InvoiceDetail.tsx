import Link from "next/link";
import type { InvoiceWithRelations } from "@/types/invoice";
import { PAYMENT_METHOD_LABELS, getInvoiceGuest, getInvoiceMobile } from "@/types/invoice";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import RecordPaymentForm from "@/components/invoices/RecordPaymentForm";
import DetailView, { formatDate } from "@/components/ui/DetailView";
import BillingSummary from "@/components/ui/BillingSummary";
import Card from "@/components/ui/Card";
import { formatAmount } from "@/lib/formatCurrency";

type InvoiceDetailProps = {
  invoice: InvoiceWithRelations;
};

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const isGroup = Boolean(invoice.group_id);
  const booking = invoice.bookings;
  const group = invoice.booking_groups;
  const payments = [...(invoice.payments ?? [])].sort(
    (a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
  );

  const nights = booking?.nights ?? 0;

  return (
    <div className="space-y-5">
      <DetailView
        title={invoice.invoice_no}
        subtitle={getInvoiceGuest(invoice)}
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
                ? `${formatDate(booking?.check_in ?? group?.check_in)} → ${formatDate(booking?.check_out ?? group?.check_out)}`
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
        totalBill={Number(invoice.total_bill)}
        advancePaid={Number(invoice.amount_paid)}
        paidLabel="Amount Paid"
        dueAmount={Number(invoice.due_amount)}
      />

      <RecordPaymentForm
        invoiceId={invoice.id}
        dueAmount={Number(invoice.due_amount)}
        disabled={invoice.status === "paid" || invoice.status === "cancelled"}
      />

      <Card padding="sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">
          Payment History
        </h3>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">
            No additional payments recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatDate(payment.paid_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {PAYMENT_METHOD_LABELS[payment.payment_method]}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {payment.reference || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                      {formatAmount(Number(payment.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
