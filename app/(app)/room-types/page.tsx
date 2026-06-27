import { createClient } from "@/lib/supabase/server";
import { RoomTypeService } from "@/services/roomType.service";
import RoomTypeList from "@/components/room-types/RoomTypeList";
import { normalizePaginationParams } from "@/types/pagination";

type RoomTypesPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
  }>;
};

export default async function RoomTypesPage({ searchParams }: RoomTypesPageProps) {
  const params = await searchParams;
  const pagination = normalizePaginationParams(params.page, params.pageSize, params.q);
  const supabase = await createClient();
  const service = new RoomTypeService(supabase);
  const result = await service.getPaginated(pagination);

  return <RoomTypeList roomTypes={result.data} pagination={result} />;
}
