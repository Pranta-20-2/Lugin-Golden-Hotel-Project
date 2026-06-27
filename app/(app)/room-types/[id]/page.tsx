import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoomTypeService } from "@/services/roomType.service";
import RoomTypeDetail from "@/components/room-types/RoomTypeDetail";
import { getTodayAvailabilityRange } from "@/lib/roomTypeAvailability";

type RoomTypeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomTypeDetailPage({
  params,
}: RoomTypeDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const { checkIn, checkOut } = getTodayAvailabilityRange();
  const supabase = await createClient();
  const service = new RoomTypeService(supabase);

  let roomType;

  try {
    roomType = await service.getByIdWithAvailability(numericId, checkIn, checkOut);
  } catch {
    notFound();
  }

  return <RoomTypeDetail roomType={roomType} />;
}
