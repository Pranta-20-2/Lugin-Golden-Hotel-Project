import { createClient } from "@/lib/supabase/server";
import { RoomService } from "@/services/room.service";
import RoomList from "@/components/rooms/RoomList";
import { normalizePaginationParams } from "@/types/pagination";
import { ROOM_STATUSES, type RoomStatus } from "@/types/room";

type RoomsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const params = await searchParams;
  const pagination = normalizePaginationParams(params.page, params.pageSize, params.q);
  const status = ROOM_STATUSES.includes(params.status as RoomStatus)
    ? (params.status as RoomStatus)
    : undefined;
  const supabase = await createClient();
  const service = new RoomService(supabase);
  const result = await service.getPaginated({ ...pagination, status });

  return <RoomList rooms={result.data} pagination={result} status={status} />;
}
