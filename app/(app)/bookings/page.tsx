import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/services/booking.service";
import BookingList from "@/components/bookings/BookingList";
import { normalizePaginationParams } from "@/types/pagination";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

type BookingsPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
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
  const service = new BookingService(supabase);
  const result = await service.getPaginated({ ...pagination, status });

  return (
    <BookingList bookings={result.data} pagination={result} status={status} />
  );
}
