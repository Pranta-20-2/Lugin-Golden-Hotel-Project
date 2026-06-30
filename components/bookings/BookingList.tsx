"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingStatus, BookingWithRelations } from "@/types/booking";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
} from "@/types/booking";
import Card from "@/components/ui/Card";
import AddButton from "@/components/ui/AddButton";
import ViewButton from "@/components/ui/ViewButton";
import BookingStatusBadge from "@/components/rooms/BookingStatusBadge";
import DeleteBookingButton from "@/components/bookings/DeleteBookingButton";
import Pagination from "@/components/ui/Pagination";
import DebouncedSearchInput from "@/components/ui/DebouncedSearchInput";
import FilterTabs from "@/components/ui/FilterTabs";
import { formatAmount } from "@/lib/formatCurrency";
import type { PaginatedResult } from "@/types/pagination";

type BookingListProps = {
  bookings: BookingWithRelations[];
  pagination: PaginatedResult<BookingWithRelations>;
  status?: BookingStatus;
};

function getStatusHref(status?: BookingStatus, search?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  params.set("page", "1");
  params.set("pageSize", "10");
  return `/bookings?${params.toString()}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BookingList({
  bookings,
  pagination,
  status,
}: BookingListProps) {
  const router = useRouter();
  const paginationQuery = { q: pagination.search, status };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <p className="text-sm text-slate-500">
          {bookings.length} booking{bookings.length === 1 ? "" : "s"}
        </p>
        <AddButton href="/bookings/new">Add Booking</AddButton>
      </div>

      <DebouncedSearchInput
        placeholder="Search booking no, guest, or room type..."
        className="max-w-md"
      />

      <FilterTabs
        label="Status"
        tabs={[
          {
            href: getStatusHref(undefined, pagination.search),
            label: "All",
            active: !status,
          },
          ...BOOKING_STATUSES.map((item) => ({
            href: getStatusHref(item, pagination.search),
            label: BOOKING_STATUS_LABELS[item],
            active: status === item,
          })),
        ]}
      />

      <Card padding="sm" className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Room Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check In
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check Out
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Due Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No bookings yet. Tap &quot;Add Booking&quot; to create one.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="cursor-pointer hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {booking.customers?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {booking.room_types?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {formatDate(booking.check_in)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {formatDate(booking.check_out)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium">
                      {Number(booking.due_amount) > 0 ? (
                        <span className="text-amber-600">
                          {formatAmount(Number(booking.due_amount))}
                        </span>
                      ) : (
                        <span className="text-emerald-600">
                          {formatAmount(Number(booking.due_amount ?? 0))}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <ViewButton href={`/bookings/${booking.id}`} />
                        <Link
                          href={`/bookings/${booking.id}/edit`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary transition hover:bg-blue-100"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/invoices?bookingId=${booking.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-50 px-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Invoice
                        </Link>
                        <DeleteBookingButton
                          id={booking.id}
                          guestName={booking.customers?.name ?? booking.booking_no}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} basePath="/bookings" query={paginationQuery} />
      </Card>

      <div className="space-y-3 md:hidden">
        {bookings.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-slate-500">
              No bookings yet. Tap &quot;Add Booking&quot; to create one.
            </p>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card
              key={booking.id}
              padding="sm"
              className="cursor-pointer transition hover:ring-primary/30"
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              <div>
                <h3 className="font-semibold text-slate-900">
                  {booking.customers?.name ?? "Guest"}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {booking.room_types?.name ?? "—"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                </p>
                <p className="mt-1 text-sm font-medium">
                  Due:{" "}
                  {Number(booking.due_amount) > 0 ? (
                    <span className="text-amber-600">
                      {formatAmount(Number(booking.due_amount))}
                    </span>
                  ) : (
                    <span className="text-emerald-600">
                      {formatAmount(Number(booking.due_amount ?? 0))}
                    </span>
                  )}
                </p>
                <div className="mt-3">
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>
              <div
                className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <ViewButton href={`/bookings/${booking.id}`} className="h-10 flex-1" />
                <Link
                  href={`/bookings/${booking.id}/edit`}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-primary"
                >
                  Edit
                </Link>
                <Link
                  href={`/invoices?bookingId=${booking.id}`}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700"
                >
                  Invoice
                </Link>
                <div className="w-full">
                  <DeleteBookingButton
                    id={booking.id}
                    guestName={booking.customers?.name ?? booking.booking_no}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="md:hidden">
        <Card padding="sm">
          <Pagination {...pagination} basePath="/bookings" query={paginationQuery} />
        </Card>
      </div>
    </div>
  );
}
