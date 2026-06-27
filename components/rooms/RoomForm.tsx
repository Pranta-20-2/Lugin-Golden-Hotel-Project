"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import type { RoomStatus, RoomWithType } from "@/types/room";
import { ROOM_STATUSES, ROOM_STATUS_LABELS } from "@/types/room";
import type { RoomType } from "@/types/roomType";
import { roomSchema } from "@/validators/room.schema";

type RoomFormProps = {
  room?: RoomWithType;
  roomTypes: RoomType[];
  redirectTo?: string;
};

const inputClass =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

export default function RoomForm({
  room,
  roomTypes,
  redirectTo = "/rooms",
}: RoomFormProps) {
  const router = useRouter();
  const isEditing = Boolean(room);
  const [roomNumber, setRoomNumber] = useState(room?.room_number ?? "");
  const [roomTypeId, setRoomTypeId] = useState(room?.room_type_id?.toString() ?? "");
  const [status, setStatus] = useState<RoomStatus>(room?.status ?? "available");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goBack() {
    router.push(redirectTo);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      room_number: roomNumber,
      room_type_id: Number(roomTypeId),
      status,
    };

    const parsed = roomSchema.safeParse(payload);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    const url = isEditing ? `/api/rooms/${room!.id}` : "/api/rooms";
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

    toast.success(isEditing ? "Room updated successfully" : "Room created successfully");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
        {isEditing ? "Edit Room" : "Add Room"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="roomNumber"
              className="mb-1.5 block text-sm font-medium text-slate-600"
            >
              Room Number
            </label>
            <input
              id="roomNumber"
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className={inputClass}
              placeholder="e.g. S-101"
            />
          </div>

          <div>
            <label
              htmlFor="roomType"
              className="mb-1.5 block text-sm font-medium text-slate-600"
            >
              Room Type
            </label>
            <select
              id="roomType"
              required
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select room type</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-sm font-medium text-slate-600"
            >
              Operational Status
            </label>
            <select
              id="status"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus)}
              className={inputClass}
            >
              <option value="" disabled>
                Select operational status
              </option>
              {ROOM_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {ROOM_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {roomTypes.length === 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Add room types before creating rooms.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={loading || roomTypes.length === 0}
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
