import type { RoomWithType } from "@/types/room";
import DeleteRoomButton from "@/components/rooms/DeleteRoomButton";
import RoomStatusBadge from "@/components/rooms/RoomStatusBadge";
import BookingStatusBadge from "@/components/rooms/BookingStatusBadge";
import DetailView, { formatDate } from "@/components/ui/DetailView";
import { formatAmount } from "@/lib/formatCurrency";

type RoomDetailProps = {
  room: RoomWithType;
};

export default function RoomDetail({ room }: RoomDetailProps) {
  return (
    <DetailView
      title={`Room ${room.room_number}`}
      subtitle="Room details"
      editHref={`/rooms/${room.id}/edit`}
      deleteSlot={
        <DeleteRoomButton id={room.id} roomNumber={room.room_number} />
      }
      fields={[
        { label: "Room Number", value: room.room_number },
        { label: "Room Type", value: room.room_types?.name ?? "Unassigned" },
        {
          label: "Rate / Night",
          value: (
            <span className="text-emerald-600">
              {room.room_types?.rate_per_night == null
                ? "—"
                : formatAmount(Number(room.room_types.rate_per_night))}
            </span>
          ),
        },
        {
          label: "Operational Status",
          value: <RoomStatusBadge status={room.status} />,
        },
        {
          label: "Current Booking",
          value: room.booking_status ? (
            <BookingStatusBadge status={room.booking_status} />
          ) : (
            "—"
          ),
        },
        { label: "Created", value: formatDate(room.created_at) },
        { label: "Updated", value: formatDate(room.updated_at) },
      ]}
    />
  );
}
