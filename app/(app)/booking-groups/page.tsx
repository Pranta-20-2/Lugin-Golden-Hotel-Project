import { createClient } from "@/lib/supabase/server";
import { BookingGroupService } from "@/services/bookingGroup.service";
import BookingGroupList from "@/components/booking-groups/BookingGroupList";
import { normalizePaginationParams } from "@/types/pagination";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

type BookingGroupsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function BookingGroupsPage({
  searchParams,
}: BookingGroupsPageProps) {
  const params = await searchParams;
  const pagination = normalizePaginationParams(
    params.page,
    params.pageSize,
    params.q
  );
  const status = BOOKING_STATUSES.includes(params.status as BookingStatus)
    ? (params.status as BookingStatus)
    : undefined;

  const supabase = await createClient();
  const service = new BookingGroupService(supabase);
  const result = await service.getPaginated({ ...pagination, status });

  return (
    <BookingGroupList groups={result.data} pagination={result} status={status} />
  );
}
