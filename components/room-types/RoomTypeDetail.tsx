import type { RoomTypeWithAvailability } from "@/types/roomType";
import DeleteRoomTypeButton from "@/components/room-types/DeleteRoomTypeButton";
import DetailView, { formatDate } from "@/components/ui/DetailView";
import { formatAmount } from "@/lib/formatCurrency";

type RoomTypeDetailProps = {
  roomType: RoomTypeWithAvailability;
};

export default function RoomTypeDetail({ roomType }: RoomTypeDetailProps) {
  return (
    <DetailView
      title={roomType.name}
      subtitle="Room type details"
      editHref={`/room-types/${roomType.id}/edit`}
      deleteSlot={
        <DeleteRoomTypeButton id={roomType.id} name={roomType.name} />
      }
      fields={[
        { label: "Name", value: roomType.name },
        {
          label: "Rate / Night",
          value: (
            <span className="text-emerald-600">
              {formatAmount(Number(roomType.rate_per_night))}
            </span>
          ),
        },
        {
          label: "Total Rooms",
          value: String(roomType.total_rooms),
        },
        {
          label: "Booked Today",
          value: String(roomType.booked_count),
        },
        {
          label: "Available Today",
          value: (
            <span
              className={
                roomType.available_count === 0
                  ? "font-semibold text-red-600"
                  : "font-semibold text-emerald-600"
              }
            >
              {roomType.available_count}
            </span>
          ),
        },
        { label: "Notes", value: roomType.notes || "—" },
        { label: "Created", value: formatDate(roomType.created_at) },
        { label: "Updated", value: formatDate(roomType.updated_at) },
      ]}
    />
  );
}
