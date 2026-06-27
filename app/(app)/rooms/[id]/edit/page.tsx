import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomService } from "@/services/room.service";
import { RoomTypeService } from "@/services/roomType.service";
import RoomForm from "@/components/rooms/RoomForm";

type EditRoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const roomService = new RoomService(supabase);
  const roomTypeService = new RoomTypeService(supabase);

  let room;
  let roomTypes;

  try {
    [room, roomTypes] = await Promise.all([
      roomService.getById(numericId),
      roomTypeService.getAll(),
    ]);
  } catch {
    notFound();
  }

  return <RoomForm room={room} roomTypes={roomTypes} />;
}
