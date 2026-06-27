import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomService } from "@/services/room.service";
import RoomDetail from "@/components/rooms/RoomDetail";

type RoomDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const service = new RoomService(supabase);

  let room;

  try {
    room = await service.getById(numericId);
  } catch {
    notFound();
  }

  return <RoomDetail room={room} />;
}
