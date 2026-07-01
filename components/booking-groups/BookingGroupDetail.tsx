import Link from "next/link";
import type { BookingGroupWithRelations } from "@/types/bookingGroup";
import type { InvoiceWithRelations } from "@/types/invoice";
import { getBookingGroupTotals } from "@/types/bookingGroup";
import DeleteBookingGroupButton from "@/components/booking-groups/DeleteBookingGroupButton";
import BookingStatusBadge from "@/components/rooms/BookingStatusBadge";
import DetailView from "@/components/ui/DetailView";
import {
  formatCheckInDateTime,
  formatCheckOutDateTime,
} from "@/lib/stayDates";
import BillingSummary from "@/components/ui/BillingSummary";
import BillingDocumentActions from "@/components/ui/BillingDocumentActions";
import { buildGroupBillingDocument } from "@/lib/billingDocument";
import { formatAmount } from "@/lib/formatCurrency";
import Card from "@/components/ui/Card";

type BookingGroupDetailProps = {
  group: BookingGroupWithRelations;
  invoice?: InvoiceWithRelations | null;
};

export default function BookingGroupDetail({
  group,
  invoice,
}: BookingGroupDetailProps) {
  const totals = getBookingGroupTotals(group);
  const linkedCustomer = group.customers;
  const documentData = buildGroupBillingDocument(group);

  return (
    <div id="invoice-print-area" className="space-y-5">
      <DetailView
        title={group.group_name}
        subtitle={`${group.contact_person} · ${group.mobile}`}
        editHref={`/booking-groups/${group.id}/edit`}
        deleteSlot={
          <DeleteBookingGroupButton id={group.id} name={group.group_name} />
        }
        extraActions={
          <>
            {invoice ? (
              <Link
                href={`/invoices/${invoice.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-50 px-4 text-sm font-semibold text-primary transition hover:bg-blue-100"
              >
                View Invoice
              </Link>
            ) : (
              <Link
                href={`/invoices?groupId=${group.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Generate Invoice
              </Link>
            )}
            <BillingDocumentActions documentData={documentData} />
          </>
        }
        fields={[
          { label: "Contact Person", value: group.contact_person },
          { label: "Mobile", value: group.mobile },
          { label: "Email", value: linkedCustomer?.email || "—" },
          { label: "National ID", value: linkedCustomer?.national_id || "—" },
          { label: "Check-in", value: formatCheckInDateTime(group.check_in) },
          {
            label: "Check-out",
            value: formatCheckOutDateTime(group.check_out),
          },
          {
            label: "Status",
            value: <BookingStatusBadge status={group.status} />,
          },
          { label: "Notes", value: group.notes || "—" },
        ]}
      />

      <BillingSummary
        roomCount={totals.roomCount}
        nights={totals.nights}
        ratePerNight={0}
        showRatePerNight={false}
        totalBill={totals.totalBill}
        advancePaid={totals.advancePaid}
        dueAmount={totals.dueAmount}
      />

      <Card padding="sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">
          Room Types in Group
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Room Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Nights
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Rate / Night
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(group.bookings ?? []).map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {booking.room_types?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {booking.nights}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatAmount(Number(booking.rate_per_night))}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                    {formatAmount(Number(booking.total_bill))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
