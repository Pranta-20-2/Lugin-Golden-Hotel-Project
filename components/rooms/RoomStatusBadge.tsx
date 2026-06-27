import type { RoomStatus } from "@/types/room";
import { ROOM_STATUS_LABELS } from "@/types/room";

const statusClasses: Record<RoomStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  occupied: "bg-red-50 text-red-700 ring-red-100",
  maintenance: "bg-amber-50 text-amber-700 ring-amber-100",
  reserved: "bg-blue-50 text-blue-700 ring-blue-100",
};

type RoomStatusBadgeProps = {
  status: RoomStatus;
};

export default function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[status]}`}
    >
      {ROOM_STATUS_LABELS[status]}
    </span>
  );
}
