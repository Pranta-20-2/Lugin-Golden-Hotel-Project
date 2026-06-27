import { createClient } from "@/lib/supabase/server";
import { RoomTypeService } from "@/services/roomType.service";
import RoomForm from "@/components/rooms/RoomForm";

export default async function NewRoomPage() {
  const supabase = await createClient();
  const roomTypeService = new RoomTypeService(supabase);
  const roomTypes = await roomTypeService.getAll();

  return <RoomForm roomTypes={roomTypes} />;
}
