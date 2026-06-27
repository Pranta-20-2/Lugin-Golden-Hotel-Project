"use client";

import Link from "next/link";
import type { RoomStatus, RoomWithType } from "@/types/room";
import { ROOM_STATUSES, ROOM_STATUS_LABELS } from "@/types/room";
import Card from "@/components/ui/Card";
import { PlusIcon } from "@/components/ui/icons";
import { formatAmount } from "@/lib/formatCurrency";
import DeleteRoomButton from "@/components/rooms/DeleteRoomButton";
import RoomStatusBadge from "@/components/rooms/RoomStatusBadge";
import Pagination from "@/components/ui/Pagination";
import DebouncedSearchInput from "@/components/ui/DebouncedSearchInput";
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
  const paginationQuery = {
    q: pagination.search,
    status,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {rooms.length} room{rooms.length === 1 ? "" : "s"} configured
        </p>
        <Link
          href="/rooms/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <PlusIcon className="h-4 w-4" />
          Add Room
        </Link>
      </div>

      <DebouncedSearchInput
        placeholder="Search room number or type..."
        className="max-w-md"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={getStatusHref(undefined, pagination.search)}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
            !status
              ? "bg-primary text-white ring-primary"
              : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          All
        </Link>
        {ROOM_STATUSES.map((item) => (
          <Link
            key={item}
            href={getStatusHref(item, pagination.search)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
              status === item
                ? "bg-primary text-white ring-primary"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {ROOM_STATUS_LABELS[item]}
          </Link>
        ))}
      </div>

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
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    No rooms yet. Tap &quot;Add Room&quot; to create one.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50">
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
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/rooms/${room.id}/edit`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary transition hover:bg-blue-100"
                        >
                          Edit
                        </Link>
                        <DeleteRoomButton id={room.id} roomNumber={room.room_number} />
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
            <Card key={room.id} padding="sm">
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
                    <span className="text-xs font-normal text-slate-400"> / night</span>
                  </p>
                </div>
                <RoomStatusBadge status={room.status} />
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={`/rooms/${room.id}/edit`}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-primary"
                >
                  Edit
                </Link>
                <div className="flex-1">
                  <DeleteRoomButton id={room.id} roomNumber={room.room_number} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="md:hidden">
        <Card padding="sm">
          <Pagination {...pagination} basePath="/rooms" query={paginationQuery} />
        </Card>
      </div>
    </div>
  );
}
