import type { BookingWithRelations } from "@/types/booking";
import DeleteBookingButton from "@/components/bookings/DeleteBookingButton";
import BookingStatusBadge from "@/components/rooms/BookingStatusBadge";
import DetailView, { formatDate } from "@/components/ui/DetailView";
import BillingSummary from "@/components/ui/BillingSummary";
import Link from "next/link";

type BookingDetailProps = {
  booking: BookingWithRelations;
};

export default function BookingDetail({ booking }: BookingDetailProps) {
  return (
    <div className="space-y-5">
      <DetailView
        title={booking.booking_no}
        subtitle={booking.customers?.name ?? "Guest booking"}
        editHref={`/bookings/${booking.id}/edit`}
        deleteSlot={
          <DeleteBookingButton
            id={booking.id}
            guestName={booking.customers?.name ?? booking.booking_no}
          />
        }
        fields={[
          { label: "Customer", value: booking.customers?.name ?? "—" },
          { label: "Mobile", value: booking.customers?.mobile ?? "—" },
          { label: "Room Type", value: booking.room_types?.name ?? "—" },
          { label: "Check-in", value: formatDate(booking.check_in) },
          { label: "Check-out", value: formatDate(booking.check_out) },
          {
            label: "Status",
            value: <BookingStatusBadge status={booking.status} />,
          },
          { label: "Notes", value: booking.notes || "—" },
          { label: "Created", value: formatDate(booking.created_at) },
          { label: "Updated", value: formatDate(booking.updated_at) },
        ]}
        extraActions={
          <Link
            href={`/invoices?bookingId=${booking.id}`}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Generate Invoice
          </Link>
        }
      />

      <BillingSummary
        nights={booking.nights}
        ratePerNight={Number(booking.rate_per_night)}
        totalBill={Number(booking.total_bill)}
        advancePaid={Number(booking.advance_paid)}
        dueAmount={Number(booking.due_amount)}
      />
    </div>
  );
}
