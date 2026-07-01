"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingGroupWithRelations } from "@/types/bookingGroup";
import {
  BOOKING_GROUP_STATUS_LABELS,
  getBookingGroupTotals,
  summarizeGroupRoomTypes,
} from "@/types/bookingGroup";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";
import Card from "@/components/ui/Card";
import AddButton from "@/components/ui/AddButton";
import ViewButton from "@/components/ui/ViewButton";
import BookingStatusBadge from "@/components/rooms/BookingStatusBadge";
import DeleteBookingGroupButton from "@/components/booking-groups/DeleteBookingGroupButton";
import Pagination from "@/components/ui/Pagination";
import DebouncedSearchInput from "@/components/ui/DebouncedSearchInput";
import FilterTabs from "@/components/ui/FilterTabs";
import { formatAmount } from "@/lib/formatCurrency";
import type { PaginatedResult } from "@/types/pagination";

type BookingGroupListProps = {
  groups: BookingGroupWithRelations[];
  pagination: PaginatedResult<BookingGroupWithRelations>;
  status?: BookingStatus;
};

function getStatusHref(status?: BookingStatus, search?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  params.set("page", "1");
  params.set("pageSize", "10");
  return `/booking-groups?${params.toString()}`;
}

function getRoomTypeSummary(group: BookingGroupWithRelations) {
  const summary = summarizeGroupRoomTypes(group);
  return summary.length > 0 ? summary.join(", ") : "—";
}

export default function BookingGroupList({
  groups,
  pagination,
  status,
}: BookingGroupListProps) {
  const router = useRouter();
  const paginationQuery = { q: pagination.search, status };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 items-center justify-between gap-3 sm:gap-4">
        <p className="text-sm text-slate-500">
          {groups.length} group{groups.length === 1 ? "" : "s"}
        </p>
        <div className="justify-self-end">
          <AddButton href="/booking-groups/new">Add Group Booking</AddButton>
        </div>
      </div>

      <DebouncedSearchInput
        placeholder="Search group name, contact, or mobile..."
        className="max-w-full"
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
            label: BOOKING_GROUP_STATUS_LABELS[item],
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
                  Group
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Room Types
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
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
              {groups.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No group bookings yet.
                  </td>
                </tr>
              ) : (
                groups.map((group) => {
                  const totals = getBookingGroupTotals(group);
                  return (
                    <tr
                      key={group.id}
                      onClick={() => router.push(`/booking-groups/${group.id}`)}
                      className="cursor-pointer hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-slate-900">
                          {group.group_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {group.contact_person}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">
                        {getRoomTypeSummary(group) ||
                          `${totals.roomCount} room(s)`}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-emerald-600">
                        {formatAmount(totals.totalBill)}
                      </td>
                      <td className="px-4 py-3.5">
                        <BookingStatusBadge status={group.status} />
                      </td>
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <ViewButton href={`/booking-groups/${group.id}`} />
                          <Link
                            href={`/booking-groups/${group.id}/edit`}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary transition hover:bg-blue-100"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/invoices?groupId=${group.id}`}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-50 px-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                          >
                            Invoice
                          </Link>
                          <DeleteBookingGroupButton
                            id={group.id}
                            name={group.group_name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          {...pagination}
          basePath="/booking-groups"
          query={paginationQuery}
        />
      </Card>

      <div className="space-y-3 md:hidden">
        {groups.map((group) => {
          const totals = getBookingGroupTotals(group);
          return (
            <Card
              key={group.id}
              padding="sm"
              className="cursor-pointer"
              onClick={() => router.push(`/booking-groups/${group.id}`)}
            >
              <h3 className="font-semibold text-slate-900">
                {group.group_name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {getRoomTypeSummary(group)}
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-600">
                {formatAmount(totals.totalBill)}
              </p>
              <div className="mt-3">
                <BookingStatusBadge status={group.status} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
