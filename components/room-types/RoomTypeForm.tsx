"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import type { RoomType } from "@/types/roomType";
import { roomTypeSchema } from "@/validators/roomType.schema";
import Card from "@/components/ui/Card";

type RoomTypeFormProps = {
  roomType?: RoomType;
  redirectTo?: string;
};

const inputClass =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

export default function RoomTypeForm({
  roomType,
  redirectTo = "/room-types",
}: RoomTypeFormProps) {
  const router = useRouter();
  const isEditing = Boolean(roomType);
  const [name, setName] = useState(roomType?.name ?? "");
  const [ratePerNight, setRatePerNight] = useState(
    roomType?.rate_per_night?.toString() ?? ""
  );
  const [totalRooms, setTotalRooms] = useState(
    roomType?.total_rooms != null ? String(roomType.total_rooms) : "1"
  );
  const [notes, setNotes] = useState(roomType?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goBack() {
    router.push(redirectTo);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      rate_per_night: Number(ratePerNight),
      total_rooms: Number(totalRooms),
      notes: notes || undefined,
    };

    const parsed = roomTypeSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    const url = isEditing
      ? `/api/room-types/${roomType!.id}`
      : "/api/room-types";
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

    toast.success(isEditing ? "Room type updated successfully" : "Room type created successfully");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
        {isEditing ? "Edit Room Type" : "Add Room Type"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-600">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Deluxe Room"
            />
          </div>
          <div>
            <label htmlFor="rate" className="mb-1.5 block text-sm font-medium text-slate-600">
              Rate per Night (SAR)
            </label>
            <input
              id="rate"
              type="number"
              min="1"
              step="1"
              required
              value={ratePerNight}
              onChange={(e) => setRatePerNight(e.target.value)}
              className={inputClass}
              placeholder="1500"
            />
          </div>
          <div>
            <label htmlFor="totalRooms" className="mb-1.5 block text-sm font-medium text-slate-600">
              Total Rooms
            </label>
            <input
              id="totalRooms"
              type="number"
              min="0"
              step="1"
              required
              value={totalRooms}
              onChange={(e) => setTotalRooms(e.target.value)}
              className={inputClass}
              placeholder="6"
            />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-600">
            Notes
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} min-h-[88px] py-3`}
            placeholder="Optional description..."
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
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
