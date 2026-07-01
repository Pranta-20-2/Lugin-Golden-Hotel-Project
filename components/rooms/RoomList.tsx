"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RoomStatus, RoomWithType } from "@/types/room";
import { ROOM_STATUSES, ROOM_STATUS_LABELS } from "@/types/room";
import Card from "@/components/ui/Card";
import AddButton from "@/components/ui/AddButton";
import ViewButton from "@/components/ui/ViewButton";
import { formatAmount } from "@/lib/formatCurrency";
import DeleteRoomButton from "@/components/rooms/DeleteRoomButton";
import RoomStatusBadge from "@/components/rooms/RoomStatusBadge";
import BookingStatusBadge from "@/components/rooms/BookingStatusBadge";
import Pagination from "@/components/ui/Pagination";
import DebouncedSearchInput from "@/components/ui/DebouncedSearchInput";
import FilterTabs from "@/components/ui/FilterTabs";
import type { PaginatedResult } from "@/types/pagination";

type RoomListProps = {
  rooms: RoomWithType[];
  pagination: PaginatedResult<RoomWithType>;
  status?: RoomStatus;
};

function getRoomTypeName(room: RoomWithType) {
  return room.room_types?.name ?? "Unassigned";
}

function getRate(room: RoomWithType) {
  const rate = room.room_types?.rate_per_night;
  return rate == null ? "—" : formatAmount(Number(rate));
}

function getStatusHref(status?: RoomStatus, search?: string) {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (search) params.set("q", search);
  params.set("page", "1");
  params.set("pageSize", "10");

  return `/rooms?${params.toString()}`;
}

export default function RoomList({ rooms, pagination, status }: RoomListProps) {
  const router = useRouter();
  const paginationQuery = {
    q: pagination.search,
    status,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center gap-3 sm:gap-4">
        <div className="order-1 md:order-2 justify-self-end">
          <AddButton href="/rooms/new">Add Room</AddButton>
        </div>

        <p className="order-2 md:order-1 text-sm text-slate-500">
          {rooms.length} room{rooms.length === 1 ? "" : "s"} configured
        </p>
      </div>

      <DebouncedSearchInput
        placeholder="Search room number or type..."
        className="max-w-full"
      />

      <FilterTabs
        label="Operational status"
        tabs={[
          {
            href: getStatusHref(undefined, pagination.search),
            label: "All",
            active: !status,
          },
          ...ROOM_STATUSES.map((item) => ({
            href: getStatusHref(item, pagination.search),
            label: ROOM_STATUS_LABELS[item],
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
                  Room Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Room Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rate / Night
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Operational Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current Booking
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No rooms yet. Tap &quot;Add Room&quot; to create one.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr
                    key={room.id}
                    onClick={() => router.push(`/rooms/${room.id}`)}
                    className="cursor-pointer hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {room.room_number}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {getRoomTypeName(room)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-emerald-600">
                      {getRate(room)}
                    </td>
                    <td className="px-4 py-3.5">
                      <RoomStatusBadge status={room.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      {room.booking_status ? (
                        <BookingStatusBadge status={room.booking_status} />
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ViewButton href={`/rooms/${room.id}`} />
                        <Link
                          href={`/rooms/${room.id}/edit`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary transition hover:bg-blue-100"
                        >
                          Edit
                        </Link>
                        <DeleteRoomButton
                          id={room.id}
                          roomNumber={room.room_number}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} basePath="/rooms" query={paginationQuery} />
      </Card>

      <div className="space-y-3 md:hidden">
        {rooms.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-slate-500">
              No rooms yet. Tap &quot;Add Room&quot; to create one.
            </p>
          </Card>
        ) : (
          rooms.map((room) => (
            <Card
              key={room.id}
              padding="sm"
              className="cursor-pointer transition hover:ring-primary/30"
              onClick={() => router.push(`/rooms/${room.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-900">
                    Room {room.room_number}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {getRoomTypeName(room)}
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {getRate(room)}
                    <span className="text-xs font-normal text-slate-400">
                      {" "}
                      / night
                    </span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RoomStatusBadge status={room.status} />
                    {room.booking_status ? (
                      <BookingStatusBadge status={room.booking_status} />
                    ) : (
                      <span className="text-xs text-slate-400">No booking</span>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="mt-4 flex gap-2 border-t border-slate-100 pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <ViewButton
                  href={`/rooms/${room.id}`}
                  className="h-10 flex-1"
                />
                <Link
                  href={`/rooms/${room.id}/edit`}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-primary"
                >
                  Edit
                </Link>
                <div className="flex-1">
                  <DeleteRoomButton
                    id={room.id}
                    roomNumber={room.room_number}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="md:hidden">
        <Card padding="sm">
          <Pagination
            {...pagination}
            basePath="/rooms"
            query={paginationQuery}
          />
        </Card>
      </div>
    </div>
  );
}
