import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomTypeService } from "@/services/roomType.service";
import RoomTypeForm from "@/components/room-types/RoomTypeForm";

type EditRoomTypePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRoomTypePage({ params }: EditRoomTypePageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const service = new RoomTypeService(supabase);

  let roomType;

  try {
    roomType = await service.getById(numericId);
  } catch {
    notFound();
  }

  return <RoomTypeForm roomType={roomType} />;
}
