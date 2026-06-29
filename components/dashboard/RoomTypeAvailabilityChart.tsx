"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import type { RoomTypeWithAvailability } from "@/types/roomType";
import {
  canSelectRoomType,
  getTodayAvailabilityRange,
  sortRoomTypesForSelect,
} from "@/lib/roomTypeAvailability";
import { formatDate } from "@/components/ui/DetailView";

export default function RoomTypeAvailabilityChart() {
  const todayRange = getTodayAvailabilityRange();
  const [checkIn, setCheckIn] = useState(todayRange.checkIn);
  const [checkOut, setCheckOut] = useState(todayRange.checkOut);
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasValidDates =
    Boolean(checkIn && checkOut) &&
    new Date(checkOut).getTime() > new Date(checkIn).getTime();

  useEffect(() => {
    if (!hasValidDates) {
      setRoomTypes([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
    });

    fetch(`/api/room-types/availability?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load availability");
        }
        setRoomTypes(data);
      })
      .catch((fetchError) => {
        if (fetchError.name === "AbortError") return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load availability"
        );
        setRoomTypes([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [checkIn, checkOut, hasValidDates]);

  const sortedRoomTypes = useMemo(
    () =>
      sortRoomTypesForSelect(roomTypes, (roomType) =>
        canSelectRoomType(roomType)
      ),
    [roomTypes]
  );

  const totals = useMemo(
    () =>
      sortedRoomTypes.reduce(
        (acc, roomType) => ({
          total: acc.total + roomType.total_rooms,
          available: acc.available + roomType.available_count,
          booked: acc.booked + roomType.booked_count,
        }),
        { total: 0, available: 0, booked: 0 }
      ),
    [sortedRoomTypes]
  );

  const maxTotal = Math.max(...sortedRoomTypes.map((item) => item.total_rooms), 1);

  return (
    <Card className="h-full lg:col-span-2">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Room Availability by Type
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Available rooms per type for the selected stay dates
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="availabilityCheckIn"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Check-in
            </label>
            <input
              id="availabilityCheckIn"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="h-10 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="availabilityCheckOut"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Check-out
            </label>
            <input
              id="availabilityCheckOut"
              type="date"
              value={checkOut}
              min={checkIn || undefined}
              onChange={(e) => setCheckOut(e.target.value)}
              className="h-10 w-full rounded-xl border-0 bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {!hasValidDates ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl bg-slate-50 px-4 py-8">
          <p className="text-center text-sm text-slate-500">
            Enter valid check-in and check-out dates to see room availability.
          </p>
        </div>
      ) : loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl bg-slate-50 px-4 py-8">
          <p className="text-sm text-slate-500">Loading availability…</p>
        </div>
      ) : error ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl bg-red-50 px-4 py-8">
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        </div>
      ) : sortedRoomTypes.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl bg-slate-50 px-4 py-8">
          <p className="text-center text-sm text-slate-500">
            No room types found. Add room types to track inventory availability.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">
              {formatDate(checkIn)} → {formatDate(checkOut)}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="font-semibold text-emerald-700">
                {totals.available} available
              </span>
              <span className="font-semibold text-amber-700">
                {totals.booked} booked
              </span>
              <span className="font-semibold text-slate-700">
                {totals.total} total
              </span>
            </div>
          </div>

          {totals.total > 0 && (
            <div className="overflow-hidden rounded-full bg-slate-100">
              <div className="flex h-5">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(totals.available / totals.total) * 100}%` }}
                  title={`Available: ${totals.available}`}
                />
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${(totals.booked / totals.total) * 100}%` }}
                  title={`Booked: ${totals.booked}`}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sortedRoomTypes.map((roomType) => {
              const availableWidth = `${Math.max(
                (roomType.available_count / roomType.total_rooms) * 100,
                roomType.available_count > 0 ? 6 : 0
              )}%`;
              const bookedWidth = `${Math.max(
                (roomType.booked_count / roomType.total_rooms) * 100,
                roomType.booked_count > 0 ? 6 : 0
              )}%`;
              const inventoryWidth = `${Math.max(
                (roomType.total_rooms / maxTotal) * 100,
                8
              )}%`;
              const isAvailable = roomType.available_count > 0;

              return (
                <div
                  key={roomType.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {roomType.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Total inventory: {roomType.total_rooms}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isAvailable
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {isAvailable ? "Available" : "Fully booked"}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <span className="font-bold text-emerald-600">
                      {roomType.available_count} free
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-amber-600">
                      {roomType.booked_count} booked
                    </span>
                  </div>

                  <div
                    className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-100"
                    style={{ width: inventoryWidth, maxWidth: "100%" }}
                  >
                    <div className="flex h-full">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: availableWidth }}
                      />
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: bookedWidth }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
