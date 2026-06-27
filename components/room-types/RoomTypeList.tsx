"use client";

import Link from "next/link";
import type { RoomType } from "@/types/roomType";
import DeleteRoomTypeButton from "@/components/room-types/DeleteRoomTypeButton";
import Card from "@/components/ui/Card";
import { PlusIcon } from "@/components/ui/icons";
import { formatAmount } from "@/lib/formatCurrency";
import Pagination from "@/components/ui/Pagination";
import DebouncedSearchInput from "@/components/ui/DebouncedSearchInput";
import type { PaginatedResult } from "@/types/pagination";

type RoomTypeListProps = {
  roomTypes: RoomType[];
  pagination: PaginatedResult<RoomType>;
};

export default function RoomTypeList({ roomTypes, pagination }: RoomTypeListProps) {
  const paginationQuery = { q: pagination.search };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {roomTypes.length} room type{roomTypes.length === 1 ? "" : "s"} configured
        </p>
        <Link
          href="/room-types/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <PlusIcon className="h-4 w-4" />
          Add Room Type
        </Link>
      </div>

      <DebouncedSearchInput
        placeholder="Search room type name..."
        className="max-w-md"
      />

      <Card padding="sm" className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rate / Night
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roomTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                    No room types yet. Tap &quot;Add Room Type&quot; to create one.
                  </td>
                </tr>
              ) : (
                roomTypes.map((roomType) => (
                  <tr key={roomType.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {roomType.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-emerald-600">
                      {formatAmount(Number(roomType.rate_per_night))}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-sm text-slate-500">
                      {roomType.notes || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/room-types/${roomType.id}/edit`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary transition hover:bg-blue-100"
                        >
                          Edit
                        </Link>
                        <DeleteRoomTypeButton
                          id={roomType.id}
                          name={roomType.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} basePath="/room-types" query={paginationQuery} />
      </Card>

      <div className="space-y-3 md:hidden">
        {roomTypes.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-slate-500">
              No room types yet. Tap &quot;Add Room Type&quot; to create one.
            </p>
          </Card>
        ) : (
          roomTypes.map((roomType) => (
            <Card key={roomType.id} padding="sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-900">
                    {roomType.name}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {formatAmount(Number(roomType.rate_per_night))}
                    <span className="text-xs font-normal text-slate-400"> / night</span>
                  </p>
                  {roomType.notes && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {roomType.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <Link
                  href={`/room-types/${roomType.id}/edit`}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-primary"
                >
                  Edit
                </Link>
                <div className="flex-1">
                  <DeleteRoomTypeButton
                    id={roomType.id}
                    name={roomType.name}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="md:hidden">
        <Card padding="sm">
          <Pagination {...pagination} basePath="/room-types" query={paginationQuery} />
        </Card>
      </div>
    </div>
  );
}
