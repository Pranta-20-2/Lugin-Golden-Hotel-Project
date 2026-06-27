"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import CustomerPicker, {
  type CustomerPickerMode,
} from "@/components/customers/CustomerPicker";
import type { BookingWithRelations } from "@/types/booking";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/types/booking";
import type { Customer } from "@/types/customer";
import type { RoomTypeWithAvailability } from "@/types/roomType";
import { bookingSchema } from "@/validators/booking.schema";
import {
  calculateDueAmount,
  calculateNights,
  calculateTotalBill,
} from "@/lib/bookingCalculations";
import { formatAmount } from "@/lib/formatCurrency";
import BillingSummary from "@/components/ui/BillingSummary";
import ProcessLoader from "@/components/ui/ProcessLoader";
import {
  canSelectRoomType,
  formatRoomTypeSelectLabel,
  resolveAvailabilityRange,
  sortRoomTypesForSelect,
} from "@/lib/roomTypeAvailability";
import { emptyCustomerFields } from "@/lib/customerFields";

type BookingFormProps = {
  booking?: BookingWithRelations;
  customers: Customer[];
  redirectTo?: string;
};

const inputClass =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

const textareaClass =
  "min-h-24 w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

export default function BookingForm({
  booking,
  customers,
  redirectTo = "/bookings",
}: BookingFormProps) {
  const router = useRouter();
  const isEditing = Boolean(booking);
  const [customerMode, setCustomerMode] = useState<CustomerPickerMode>(() =>
    customers.length === 0 && !isEditing ? "new" : "existing"
  );
  const [customerId, setCustomerId] = useState(
    booking?.customer_id ? String(booking.customer_id) : ""
  );
  const [newCustomer, setNewCustomer] = useState(emptyCustomerFields);
  const [roomTypeId, setRoomTypeId] = useState(
    booking?.room_type_id ? String(booking.room_type_id) : ""
  );
  const [status, setStatus] = useState<BookingStatus>(
    booking?.status ?? "confirmed"
  );
  const [checkIn, setCheckIn] = useState(booking?.check_in ?? "");
  const [checkOut, setCheckOut] = useState(booking?.check_out ?? "");
  const [advancePaid, setAdvancePaid] = useState(
    booking?.advance_paid != null ? String(booking.advance_paid) : "0"
  );
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nights = calculateNights(checkIn, checkOut);
  const selectedRoomType = roomTypes.find(
    (roomType) => String(roomType.id) === roomTypeId
  );
  const ratePerNight = Number(selectedRoomType?.rate_per_night ?? 0);
  const totalBill = useMemo(
    () => calculateTotalBill(nights, ratePerNight),
    [nights, ratePerNight]
  );
  const dueAmount = useMemo(
    () => calculateDueAmount(totalBill, Number(advancePaid) || 0),
    [totalBill, advancePaid]
  );

  const currentRoomTypeId = booking?.room_type_id ?? undefined;
  const sortedRoomTypes = useMemo(
    () =>
      sortRoomTypesForSelect(roomTypes, (roomType) =>
        canSelectRoomType(roomType, { currentRoomTypeId })
      ),
    [roomTypes, currentRoomTypeId]
  );
  const selectableRoomTypeCount = useMemo(
    () =>
      roomTypes.filter((roomType) =>
        canSelectRoomType(roomType, { currentRoomTypeId })
      ).length,
    [roomTypes, currentRoomTypeId]
  );

  const hasValidDates =
    checkIn &&
    checkOut &&
    new Date(checkOut).getTime() > new Date(checkIn).getTime();

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

    if (booking?.id) {
      params.set("exclude_booking_id", String(booking.id));
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
  }, [checkIn, checkOut, booking?.id, hasValidDates]);

  function goBack() {
    router.push(redirectTo);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload =
      customerMode === "existing"
        ? {
            customer_mode: "existing" as const,
            customer_id: customerId,
            room_type_id: roomTypeId,
            check_in: checkIn,
            check_out: checkOut,
            advance_paid: advancePaid,
            status,
            notes,
          }
        : {
            customer_mode: "new" as const,
            customer: newCustomer,
            room_type_id: roomTypeId,
            check_in: checkIn,
            check_out: checkOut,
            advance_paid: advancePaid,
            status,
            notes,
          };

    const parsed = bookingSchema.safeParse(payload);
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

    const url = isEditing ? `/api/bookings/${booking!.id}` : "/api/bookings";
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

    toast.success(
      isEditing
        ? "Booking updated successfully"
        : "Booking created successfully"
    );
    router.push(redirectTo);
    router.refresh();
  }

  const canSubmitCustomer =
    customerMode === "new" ||
    (customerMode === "existing" && customerId !== "");

  return (
    <Card>
      <ProcessLoader visible={loading} label="Saving booking" />
      <h2 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
        {isEditing ? "Edit Booking" : "Add Booking"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-600">
            Customer <span className="text-red-500">*</span>
          </p>
          <CustomerPicker
            mode={customerMode}
            onModeChange={setCustomerMode}
            customers={customers}
            customerId={customerId}
            onCustomerIdChange={setCustomerId}
            newCustomer={newCustomer}
            onNewCustomerChange={setNewCustomer}
            showModeToggle={!isEditing}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="checkIn"
              className="mb-1.5 block text-sm font-medium text-slate-600"
            >
              Check-in <span className="text-red-500">*</span>
            </label>
            <input
              id="checkIn"
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="checkOut"
              className="mb-1.5 block text-sm font-medium text-slate-600"
            >
              Check-out <span className="text-red-500">*</span>
            </label>
            <input
              id="checkOut"
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="roomTypeId"
              className="mb-1.5 block text-sm font-medium text-slate-600"
            >
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              id="roomTypeId"
              required
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              disabled={loadingAvailability}
              className={inputClass}
            >
              <option value="">
                {loadingAvailability
                  ? "Loading availability…"
                  : "Select room type"}
              </option>
              {sortedRoomTypes.map((roomType) => {
                const selectable = canSelectRoomType(roomType, {
                  currentRoomTypeId,
                });
                return (
                  <option
                    key={roomType.id}
                    value={roomType.id}
                    disabled={!selectable}
                  >
                    {formatRoomTypeSelectLabel(roomType, selectable)} ·{" "}
                    {formatAmount(Number(roomType.rate_per_night))}/night
                  </option>
                );
              })}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              {hasValidDates
                ? "Total and available counts are for your selected check-in and check-out dates."
                : "Enter check-in and check-out dates to see availability."}
            </p>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-sm font-medium text-slate-600"
            >
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className={inputClass}
            >
              {BOOKING_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {BOOKING_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <BillingSummary
          nights={nights}
          ratePerNight={ratePerNight}
          totalBill={totalBill}
          dueAmount={dueAmount}
          advanceInput={{
            id: "advancePaid",
            value: advancePaid,
            onChange: setAdvancePaid,
          }}
        />

        <div>
          <label
            htmlFor="notes"
            className="mb-1.5 block text-sm font-medium text-slate-600"
          >
            Notes <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={textareaClass}
            placeholder="Optional booking notes"
          />
        </div>

        {hasValidDates &&
          !loadingAvailability &&
          selectableRoomTypeCount === 0 &&
          roomTypes.length > 0 && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              No room types are available for the selected dates.
            </p>
          )}

        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Nights, rate, total bill, and due amount are calculated automatically
          from the selected room type.
        </p>

        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={
              loading ||
              !canSubmitCustomer ||
              !hasValidDates ||
              loadingAvailability ||
              selectableRoomTypeCount === 0
            }
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={goBack}
            className="h-11 rounded-xl bg-slate-100 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}
