import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  BookingService,
  BookingServiceError,
} from "@/services/booking.service";
import { normalizePaginationParams } from "@/types/pagination";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

async function getAuthenticatedService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { service: new BookingService(supabase) };
}

function handleServiceError(error: unknown) {
  if (error instanceof BookingServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(request: Request) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const pagination = normalizePaginationParams(
      searchParams.get("page"),
      searchParams.get("pageSize"),
      searchParams.get("q")
    );
    const statusParam = searchParams.get("status");
    const status = BOOKING_STATUSES.includes(statusParam as BookingStatus)
      ? (statusParam as BookingStatus)
      : undefined;

    const bookings = await result.service.getPaginated({
      ...pagination,
      status,
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function POST(request: Request) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  try {
    const body = await request.json();
    const booking = await result.service.create(body);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
