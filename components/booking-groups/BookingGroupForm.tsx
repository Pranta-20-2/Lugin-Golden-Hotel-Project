"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import type { BookingGroupWithRelations } from "@/types/bookingGroup";
import {
  BOOKING_GROUP_STATUS_LABELS,
  getBookingGroupTotals,
} from "@/types/bookingGroup";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";
import type { RoomTypeWithAvailability } from "@/types/roomType";
import {
  bookingGroupSchema,
  groupBookingsToLines,
} from "@/validators/bookingGroup.schema";
import { formatAmount } from "@/lib/formatCurrency";
import {
  calculateDueAmount,
  calculateNights,
  calculateTotalBill,
} from "@/lib/bookingCalculations";
import { resolveAvailabilityRange } from "@/lib/roomTypeAvailability";
import BillingSummary from "@/components/ui/BillingSummary";
import ProcessLoader from "@/components/ui/ProcessLoader";
import CustomerFields from "@/components/customers/CustomerFields";
import {
  customerToFieldValues,
  emptyCustomerFields,
} from "@/lib/customerFields";

type BookingGroupFormProps = {
  group?: BookingGroupWithRelations;
  redirectTo?: string;
};

type QuantityMap = Record<number, number>;

const inputClass =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

const textareaClass =
  "min-h-24 w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

export default function BookingGroupForm({
  group,
  redirectTo = "/booking-groups",
}: BookingGroupFormProps) {
  const router = useRouter();
  const isEditing = Boolean(group);
  const [groupName, setGroupName] = useState(group?.group_name ?? "");
  const [customer, setCustomer] = useState(() => {
    if (group?.customers) {
      return customerToFieldValues(group.customers);
    }
    if (group) {
      return {
        ...emptyCustomerFields(),
        name: group.contact_person,
        mobile: group.mobile,
      };
    }
    return emptyCustomerFields();
  });
  const [checkIn, setCheckIn] = useState(group?.check_in ?? "");
  const [checkOut, setCheckOut] = useState(group?.check_out ?? "");
  const [status, setStatus] = useState<BookingStatus>(group?.status ?? "confirmed");
  const [advancePaid, setAdvancePaid] = useState(
    String(group ? getBookingGroupTotals(group).advancePaid : 0)
  );
  const [notes, setNotes] = useState(group?.notes ?? "");
  const [quantities, setQuantities] = useState<QuantityMap>(() => {
    const initial: QuantityMap = {};
    if (group?.bookings) {
      for (const line of groupBookingsToLines(group.bookings)) {
        initial[line.room_type_id] = line.quantity;
      }
    }
    return initial;
  });
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nights = calculateNights(checkIn, checkOut);
  const hasValidDates =
    checkIn &&
    checkOut &&
    new Date(checkOut).getTime() > new Date(checkIn).getTime();

  const roomTypeLines = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([roomTypeId, quantity]) => ({
          room_type_id: Number(roomTypeId),
          quantity,
        })),
    [quantities]
  );

  const totalBill = useMemo(() => {
    return roomTypeLines.reduce((sum, line) => {
      const roomType = roomTypes.find((item) => item.id === line.room_type_id);
      const rate = Number(roomType?.rate_per_night ?? 0);
      return sum + calculateTotalBill(nights, rate) * line.quantity;
    }, 0);
  }, [roomTypeLines, roomTypes, nights]);

  const totalRoomsSelected = roomTypeLines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );
  const dueAmount = calculateDueAmount(totalBill, Number(advancePaid) || 0);

  useEffect(() => {
    if (!hasValidDates) {
      setRoomTypes([]);
      return;
    }

    const { checkIn: availIn, checkOut: availOut } = resolveAvailabilityRange(
      checkIn,
      checkOut
    );

    const params = new URLSearchParams({
      check_in: availIn,
      check_out: availOut,
    });

    if (group?.id) {
      params.set("exclude_group_id", String(group.id));
    }

    setLoadingAvailability(true);

    fetch(`/api/room-types/availability?${params.toString()}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load room availability");
        }
        setRoomTypes(data);
      })
      .catch((fetchError: Error) => {
        toast.error(fetchError.message);
        setRoomTypes([]);
      })
      .finally(() => setLoadingAvailability(false));
  }, [checkIn, checkOut, group?.id, hasValidDates]);

  function setQuantity(roomTypeId: number, nextQuantity: number) {
    setQuantities((current) => ({
      ...current,
      [roomTypeId]: Math.max(0, nextQuantity),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      group_name: groupName,
      customer,
      check_in: checkIn,
      check_out: checkOut,
      status,
      advance_paid: advancePaid,
      notes,
      room_type_lines: roomTypeLines,
    };

    const parsed = bookingGroupSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      setError(message);
      toast.error(message);
      return;
    }

    if ((parsed.data.advance_paid ?? 0) > totalBill) {
      const message = "Advance paid cannot exceed total bill";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    const url = isEditing
      ? `/api/booking-groups/${group!.id}`
      : "/api/booking-groups";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.error ?? "Something went wrong";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success(isEditing ? "Group updated successfully" : "Group created successfully");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card>
      <ProcessLoader visible={loading} label="Saving group booking" />
      <h2 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
        {isEditing ? "Edit Group Booking" : "Add Group Booking"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={inputClass}
              placeholder="e.g. ABC Company"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className={inputClass}
            >
              {BOOKING_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {BOOKING_GROUP_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Check-in <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Check-out <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-600">
            Contact / Customer Details <span className="text-red-500">*</span>
          </p>
          <CustomerFields
            values={customer}
            onChange={setCustomer}
            idPrefix="group-customer"
            nameLabel="Contact Name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Notes <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={textareaClass}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-600">
            Select Room Types <span className="text-red-500">*</span>
          </p>
          <p className="mb-2 text-xs text-slate-500">
            {hasValidDates
              ? "Total and available counts are for your selected check-in and check-out dates."
              : "Enter check-in and check-out dates to see availability."}
          </p>
          {!hasValidDates && (
            <p className="text-sm text-slate-500">
              Select valid dates above to load room availability.
            </p>
          )}
          {loadingAvailability && (
            <p className="text-sm text-slate-500">Loading availability…</p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {roomTypes.map((roomType) => {
              const quantity = quantities[roomType.id] ?? 0;
              const maxSelectable = roomType.available_count;
              const rate = Number(roomType.rate_per_night ?? 0);

              return (
                <div
                  key={roomType.id}
                  className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {roomType.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {roomType.notes ?? "No notes"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatAmount(rate)}/night · Total: {roomType.total_rooms} ·
                        Available: {roomType.available_count}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={quantity <= 0}
                        onClick={() => setQuantity(roomType.id, quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={quantity >= maxSelectable}
                        onClick={() => setQuantity(roomType.id, quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <BillingSummary
          roomCount={totalRoomsSelected}
          nights={nights}
          ratePerNight={0}
          showRatePerNight={false}
          totalBill={totalBill}
          dueAmount={dueAmount}
          advanceInput={{
            id: "groupAdvancePaid",
            value: advancePaid,
            onChange: setAdvancePaid,
          }}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={
              loading ||
              !hasValidDates ||
              loadingAvailability ||
              totalRoomsSelected === 0
            }
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => router.push(redirectTo)}
            className="h-11 rounded-xl bg-slate-100 px-6 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}
